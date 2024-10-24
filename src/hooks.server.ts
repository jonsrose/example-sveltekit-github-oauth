import { TokenBucket } from "$lib/server/rate-limit";
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from "$lib/server/session";
import { sequence } from "@sveltejs/kit/hooks";

import type { Handle } from "@sveltejs/kit";

const bucket = new TokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	// Note: Assumes X-Forwarded-For will always be defined.
	const clientIP = event.request.headers.get("X-Forwarded-For");
	if (clientIP === null) {
		return resolve(event);
	}
	let cost: number;
	if (event.request.method === "GET" || event.request.method === "OPTIONS") {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response("Too many requests", {
			status: 429
		});
	}
	return resolve(event);
};

const csrfProtectionHandle: Handle = async ({ event, resolve }) => {
	if (event.request.method !== "GET" && event.request.method !== "OPTIONS") {
		const origin = event.request.headers.get("Origin");
		// Allow both www and non-www versions
		const allowedOrigins = [
			'https://www-dev.aiutils.site',
			'https://aiutils.site'
		];
		
		if (origin === null || !allowedOrigins.includes(origin)) {
			return new Response("Forbidden", { status: 403 });
		}
	}
	return resolve(event);
};

export const handle = sequence(
	rateLimitHandle,
	csrfProtectionHandle,
	async ({ event, resolve }) => {
		const sessionToken = event.cookies.get("session");
		if (sessionToken) {
			const { session, user } = await validateSessionToken(sessionToken);
			if (session && user) {
				event.locals.user = user;
				event.locals.session = session;
			}
		}
		return resolve(event);
	}
);
