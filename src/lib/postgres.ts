import 'server-only';
import path from 'node:path';
import { Pool, type QueryResultRow } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgSchemaReady: Promise<void> | undefined;
}

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  });
}

async function ensureSchema(pool: Pool) {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
}

export function getPool() {
  if (!global.__pgPool) {
    global.__pgPool = createPool();
  }
  if (!global.__pgSchemaReady) {
    global.__pgSchemaReady = ensureSchema(global.__pgPool);
  }
  return global.__pgPool;
}

export async function withSchema() {
  getPool();
  await global.__pgSchemaReady;
}

/** Run a parameterized query against the pool, ensuring schema exists first. */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  await withSchema();
  const pool = getPool();
  return pool.query<T>(text, params);
}

/** Run a callback inside a transaction on a single checked-out client. */
export async function transaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>) {
  await withSchema();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
