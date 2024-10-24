import { db } from "./db";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { User } from "./user";
import type { RequestEvent } from "@sveltejs/kit";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await db.queryOne(
		`
SELECT 
  session.id, session.user_id, session.expires_at, 
  app_user.id, app_user.github_id, app_user.email, app_user.username 
FROM session
INNER JOIN app_user ON session.user_id = app_user.id
WHERE session.id = $1
`,
		[sessionId]
	);

	if (row === null) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.string(0),
		userId: row.number(1),
		expiresAt: new Date(row.get(2) as Date)
	};
	const user: User = {
		id: row.number(3),
		githubId: row.number(4),
		email: row.string(5),
		username: row.string(6)
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.execute("DELETE FROM session WHERE id = $1", [session.id]);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db.execute("UPDATE session SET expires_at = $1 WHERE session.id = $2", [
			Math.floor(session.expiresAt.getTime() / 1000),
			session.id
		]);
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.execute("DELETE FROM session WHERE id = $1", [sessionId]);
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await db.execute("DELETE FROM session WHERE user_id = $1", [userId]);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32(tokenBytes).toLowerCase();
	return token;
}

export async function createSession(token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

	await db.execute(
		`
		INSERT INTO session (id, user_id, expires_at)
		VALUES ($1, $2, $3)
		`,
		[sessionId, userId, expiresAt]
	);

	return {
		id: sessionId,
		userId: userId,
		expiresAt
	};
}

export interface Session {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
