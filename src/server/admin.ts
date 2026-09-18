import {
	createHash,
	randomBytes,
	scryptSync,
	timingSafeEqual,
} from "node:crypto";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";
import { desc, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { rsvps, sessions, settings } from "../db/schema";
import { assertSameOrigin } from "./csrf";
import { rateLimitLogin } from "./rate-limit";

const PASSWORD_KEY = "admin_password";
const FORCE_CHANGE_KEY = "force_password_change";

const SESSION_COOKIE = "wedding_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Fixed salt used only to verify the env-var fallback password deterministically.
const ENV_PASSWORD_SALT = createHash("sha256")
	.update("wedding-invitation:admin-env-salt")
	.digest("hex")
	.slice(0, 32);

const sessionCookieOptions = {
	httpOnly: true,
	sameSite: "lax",
	path: "/",
	secure: process.env.NODE_ENV === "production",
	maxAge: SESSION_TTL_SECONDS,
} as const;

function hashPassword(
	password: string,
	salt = randomBytes(16).toString("hex"),
) {
	const key = scryptSync(password, salt, 64);
	return `${salt}:${key.toString("hex")}`;
}

function safeEqual(a: string, b: string) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

function verifyPassword(input: string, stored: string) {
	const separator = stored.indexOf(":");
	if (separator > 0) {
		const salt = stored.slice(0, separator);
		const expected = stored.slice(separator + 1);
		return safeEqual(expected, hashPassword(input, salt).split(":")[1] ?? "");
	}
	// Legacy plaintext value stored before password hashing was introduced.
	return safeEqual(input, stored);
}

async function getStoredPassword() {
	const row = await db
		.select({ value: settings.value })
		.from(settings)
		.where(eq(settings.key, PASSWORD_KEY))
		.get();
	return row?.value ?? null;
}

type PasswordMatch = {
	ok: boolean;
	// True when the password was verified against a legacy plaintext DB value
	// that should be upgraded to a hash.
	shouldMigrate: boolean;
};

async function passwordMatches(input: string): Promise<PasswordMatch> {
	const stored = await getStoredPassword();
	if (stored) {
		const ok = verifyPassword(input, stored);
		return { ok, shouldMigrate: ok && !stored.includes(":") };
	}

	const envPassword = process.env.ADMIN_PASSWORD;
	if (!envPassword) {
		throw new Error("Admin is not configured. Set ADMIN_PASSWORD.");
	}
	return {
		ok: verifyPassword(input, hashPassword(envPassword, ENV_PASSWORD_SALT)),
		shouldMigrate: false,
	};
}

async function upsertPassword(value: string) {
	await db
		.insert(settings)
		.values({ key: PASSWORD_KEY, value })
		.onConflictDoUpdate({ target: settings.key, set: { value } });
}

async function getForcePasswordChange() {
	const row = await db
		.select({ value: settings.value })
		.from(settings)
		.where(eq(settings.key, FORCE_CHANGE_KEY))
		.get();
	return row?.value != null && ["1", "true"].includes(row.value.toLowerCase());
}

async function setForcePasswordChange(force: boolean) {
	await db
		.insert(settings)
		.values({ key: FORCE_CHANGE_KEY, value: force ? "1" : "0" })
		.onConflictDoUpdate({
			target: settings.key,
			set: { value: force ? "1" : "0" },
		});
}

export async function assertPasswordChanged() {
	if (await getForcePasswordChange()) {
		throw new Error(
			"You must change your temporary password before continuing.",
		);
	}
}

async function createSession() {
	const token = randomBytes(32).toString("base64url");
	await db.insert(sessions).values({
		token,
		expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
	});
	setCookie(SESSION_COOKIE, token, sessionCookieOptions);
}

async function currentSessionToken() {
	const token = getCookie(SESSION_COOKIE);
	if (!token) return null;

	const row = await db
		.select({ expiresAt: sessions.expiresAt })
		.from(sessions)
		.where(eq(sessions.token, token))
		.get();

	if (!row) return null;
	if (Date.parse(row.expiresAt) <= Date.now()) {
		await db.delete(sessions).where(eq(sessions.token, token));
		return null;
	}
	return token;
}

export const requireAuth = createServerOnlyFn(async () => {
	const token = await currentSessionToken();
	if (!token) {
		throw new Error("You must be signed in.");
	}
	return token;
});

async function destroySession() {
	const token = getCookie(SESSION_COOKIE);
	if (token) {
		await db.delete(sessions).where(eq(sessions.token, token));
	}
	deleteCookie(SESSION_COOKIE, sessionCookieOptions);
}

export const getAuthStatus = createServerFn({ method: "GET" }).handler(
	async () => {
		const authed = Boolean(await currentSessionToken());
		return {
			authed,
			forcePasswordChange: authed ? await getForcePasswordChange() : false,
		};
	},
);

const loginSchema = z.object({
	password: z.string().min(1, "Please enter the admin password"),
});

export const login = createServerFn({ method: "POST" })
	.validator(loginSchema)
	.handler(async ({ data }) => {
		assertSameOrigin();
		rateLimitLogin();

		const { ok, shouldMigrate } = await passwordMatches(data.password);
		if (!ok) {
			throw new Error("Incorrect password.");
		}
		if (shouldMigrate) {
			await upsertPassword(hashPassword(data.password));
		}
		await createSession();
		return {
			success: true,
			forcePasswordChange: await getForcePasswordChange(),
		};
	});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
	assertSameOrigin();
	await destroySession();
	return { success: true };
});

export const listRsvps = createServerFn({ method: "POST" }).handler(
	async () => {
		await requireAuth();
		await assertPasswordChanged();

		return db
			.select({
				id: rsvps.id,
				name: rsvps.name,
				email: rsvps.email,
				attending: rsvps.attending,
				guests: rsvps.guests,
				message: rsvps.message,
				createdAt: rsvps.createdAt,
			})
			.from(rsvps)
			.orderBy(desc(rsvps.createdAt));
	},
);

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePassword = createServerFn({ method: "POST" })
	.validator(changePasswordSchema)
	.handler(async ({ data }) => {
		assertSameOrigin();
		const token = await requireAuth();

		const { ok } = await passwordMatches(data.currentPassword);
		if (!ok) {
			throw new Error("Current password is incorrect.");
		}

		await upsertPassword(hashPassword(data.newPassword));
		await setForcePasswordChange(false);

		// Revoke all other sessions; keep the current one signed in.
		await db.delete(sessions).where(ne(sessions.token, token));

		return { success: true };
	});
