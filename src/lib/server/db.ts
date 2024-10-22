import { Pool } from 'pg';
import { SyncDatabase } from "@pilcrowjs/db-query";
import type { SyncAdapter } from "@pilcrowjs/db-query";

const pool = new Pool({
	// Your PostgreSQL connection details
	connectionString: process.env.DATABASE_URL
});

const adapter: SyncAdapter<any> = {
	query: (statement: string, params: unknown[]): unknown[][] => {
		const result = pool.query(statement, params);
		return result.rows;
	},
	execute: (statement: string, params: unknown[]): any => {
		return pool.query(statement, params);
	}
};

export const db = new SyncDatabase(adapter);
