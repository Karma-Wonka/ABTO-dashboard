import 'server-only';
import { sql, type QueryResultRow } from '@vercel/postgres';
import type { VercelPoolClient } from '@vercel/postgres';

// Cache the schema-init promise on `global` so Next.js dev-mode
// hot-reloading and concurrent requests don't race to CREATE TABLE.
declare global {
  // eslint-disable-next-line no-var
  var __dbSchemaReady: Promise<void> | undefined;
}

async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Auth (NextAuth Credentials provider) ---------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL
    )
  `;

  // ABTO content tables ---------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      website TEXT NOT NULL,
      description TEXT NOT NULL,
      specialties TEXT NOT NULL,
      languages TEXT NOT NULL,
      member_since INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      is_past INTEGER NOT NULL DEFAULT 0,
      detail_link TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Added after the initial news table — ADD COLUMN IF NOT EXISTS keeps
  // this safe to run against a database that was seeded before image_url
  // existed.
  await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      doc_type TEXT NOT NULL,
      size TEXT,
      year TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Added after the initial documents table, for uploaded files (e.g. the
  // Event Calendar PDF) — same ADD COLUMN IF NOT EXISTS safety as image_url
  // above.
  await sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url TEXT`;

  // Editable copy for the public website (web/) — key/value so new
  // sections don't need a migration. `value` is JSONB: a scalar section
  // stores an object of fields, a list section stores an array of item
  // objects. See src/constants/site-content.ts for the full key catalogue.
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Migrates the original 5 plain-TEXT keys (hero_subtitle, about_intro,
  // contact_address/phone/email) to JSONB in place. `to_jsonb` on an
  // already-JSONB column is a no-op, so this is safe to run on every
  // cold start alongside the CREATE TABLEs above.
  await sql`
    ALTER TABLE site_content ALTER COLUMN value TYPE JSONB USING to_jsonb(value)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS committee (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      seat_order INTEGER NOT NULL DEFAULT 0,
      photo_url TEXT,
      is_vacant INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS destinations (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      image_url TEXT,
      seat_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      message TEXT,
      payload JSONB NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    )
  `;

  // Roles & permissions ---------------------------------------------------
  // Dynamic RBAC: roles are rows an admin can create/edit/delete, each with
  // a set of permission keys attached (src/constants/rbac-data.ts).
  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      is_system BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      is_system BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )
  `;
}

// Call at the top of every store method before querying. Cheap after the
// first call — CREATE TABLE IF NOT EXISTS is a no-op once tables exist.
export function ensureSchema(): Promise<void> {
  if (!global.__dbSchemaReady) {
    global.__dbSchemaReady = initSchema();
  }
  return global.__dbSchemaReady;
}

/**
 * Positional-param query helper ($1, $2, ...) — `sql` is a real `Pool`
 * under the hood (@neondatabase/serverless), not HTTP-only, so this is
 * just `sql.query`. Lets store modules use plain parameterized SQL
 * instead of the tagged-template form where that reads more naturally.
 */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  await ensureSchema();
  return sql.query<T>(text, params);
}

/** Run a callback inside a transaction on a single checked-out client. */
export async function transaction<T>(fn: (client: VercelPoolClient) => Promise<T>) {
  await ensureSchema();
  const client = await sql.connect();
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

export { sql };
