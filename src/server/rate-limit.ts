import { getRequestIP } from "@tanstack/react-start/server";

type Bucket = {
	count: number;
	resetAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 5;
const RSVP_LIMIT = 5;
const MAX_BUCKETS = 25_000;

const buckets = new Map<string, Bucket>();

const prunerKey = Symbol.for("wedding-invitation:rate-limit-pruner");
const prunerAttached = (globalThis as Record<symbol, true | undefined>)[
	prunerKey
];
if (!prunerAttached) {
	(globalThis as Record<symbol, true>)[prunerKey] = true;
	const pruner = setInterval(
		() => {
			const now = Date.now();
			if (buckets.size > MAX_BUCKETS) {
				for (const [key, bucket] of buckets) {
					if (bucket.resetAt <= now) buckets.delete(key);
				}
			}
		},
		5 * 60 * 1000,
	);
	pruner.unref?.();
}

function clientIp() {
	return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

function consume(namespace: string, limit: number, message: string) {
	const now = Date.now();
	const key = `${namespace}:${clientIp()}`;
	let bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		bucket = { count: 0, resetAt: now + WINDOW_MS };
		buckets.set(key, bucket);
	}
	bucket.count += 1;
	if (bucket.count > limit) {
		throw new Error(message);
	}
}

export function rateLimitLogin() {
	consume(
		"login",
		LOGIN_LIMIT,
		"Too many login attempts. Please try again in 15 minutes.",
	);
}

export function rateLimitRsvp() {
	consume(
		"rsvp",
		RSVP_LIMIT,
		"Too many RSVP submissions. Please try again in 15 minutes.",
	);
}
