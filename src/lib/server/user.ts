import { db } from "./db";

export async function createUser(githubId: number, email: string, username: string): Promise<User> {
	const row = await db.queryOne("INSERT INTO user (github_id, email, username) VALUES (?, ?, ?) RETURNING user.id", [
		githubId,
		email,
		username
	]);
	if (row === null) {
		throw new Error("Unexpected error");
	}
	const user: User = {
		id: row.number(0),
		githubId,
		email,
		username
	};
	return user;
}

export async function getUserFromGitHubId(githubId: number): Promise<User | null> {
	const row = await db.queryOne("SELECT id, github_id, email, username FROM user WHERE github_id = ?", [githubId]);
	if (row === null) {
		return null;
	}
	const user: User = {
		id: row.number(0),
		githubId: row.number(1),
		email: row.string(2),
		username: row.string(3)
	};
	return user;
}

export interface User {
	id: number;
	email: string;
	githubId: number;
	username: string;
}
