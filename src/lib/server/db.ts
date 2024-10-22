import pkg from 'pg';
const { Pool } = pkg;
import { AsyncDatabase } from "@pilcrowjs/db-query";
import type { AsyncAdapter } from "@pilcrowjs/db-query";

const pool = new Pool({
	// Your PostgreSQL connection details
	connectionString: process.env.DATABASE_URL
});

const adapter: AsyncAdapter<any> = {
	query: async (statement: string, params: unknown[]): Promise<unknown[][]> => {
		const result = await pool.query(statement, params);
		return result.rows;
	},
	execute: async (statement: string, params: unknown[]): Promise<any> => {
		return pool.query(statement, params);
	}
};

export const db = new AsyncDatabase(adapter);
