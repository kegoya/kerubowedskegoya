import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { rsvps, settings } from "../db/schema";

const PASSWORD_KEY = "admin_password";

async function getAdminPassword() {
	const row = await db
		.select({ value: settings.value })
		.from(settings)
		.where(eq(settings.key, PASSWORD_KEY))
		.get();

	const stored = row?.value;
	if (stored) return stored;

	const envPassword = process.env.ADMIN_PASSWORD;
	if (envPassword) return envPassword;

	throw new Error("Admin is not configured. Set ADMIN_PASSWORD.");
}

export const listRsvps = createServerFn({ method: "POST" })
	.validator(
		z.object({
			password: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		const adminPassword = await getAdminPassword();

		if (data.password !== adminPassword) {
			throw new Error("Incorrect password.");
		}

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
	});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePassword = createServerFn({ method: "POST" })
	.validator(changePasswordSchema)
	.handler(async ({ data }) => {
		const adminPassword = await getAdminPassword();

		if (data.currentPassword !== adminPassword) {
			throw new Error("Current password is incorrect.");
		}

		await db
			.insert(settings)
			.values({ key: PASSWORD_KEY, value: data.newPassword })
			.onConflictDoUpdate({
				target: settings.key,
				set: { value: data.newPassword },
			});

		return { success: true };
	});
