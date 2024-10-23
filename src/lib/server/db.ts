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
		console.log("Executing SQL:", statement, "with params:", params);
		const result = await pool.query({
			text: statement,
			values: params,
			rowMode: 'array'
		});
		return result.rows;
	},
	execute: async (statement: string, params: unknown[]): Promise<any> => {
		console.log("Executing SQL:", statement, "with params:", params);
		return pool.query({
			text: statement,
			values: params,
			rowMode: 'array'
		});
	}
};

export const db = new AsyncDatabase(adapter);
