import { getRequestHeader, getRequestHost } from "@tanstack/react-start/server";

export function assertSameOrigin() {
	const origin = getRequestHeader("origin");
	if (!origin) return;

	const host = getRequestHost({ xForwardedHost: true });
	let originHost: string;
	try {
		originHost = new URL(origin).host;
	} catch {
		throw new Error("Invalid Origin header.");
	}
	if (originHost !== host) {
		throw new Error("Cross-origin request rejected.");
	}
}
