import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const db = globalForPg.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: true },
});

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = db;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
