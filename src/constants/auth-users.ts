// ============================================================
// Auth user store — server-only, Postgres-backed, bcrypt-hashed passwords
// ============================================================
// Backs the NextAuth Credentials provider (src/lib/auth.ts). `role` is a
// free-text reference to a row in the `roles` table (src/constants/
// rbac-data.ts) — not a hardcoded 'admin' | 'member' union, since roles
// are now dynamic. AUTO_ADMIN_EMAILS is a one-time bootstrap so the real
// ABTO secretariat contacts get the Admin role on their first sign-up
// without anyone needing direct database access.
// ============================================================
import 'server-only';
import bcrypt from 'bcryptjs';
import { ensureSchema, sql } from '@/lib/db';
import { rolesStore } from '@/constants/rbac-data';

export type AuthUser = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  role: string;
  created_at: string;
};

function autoAdminEmails(): string[] {
  return (process.env.AUTO_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authUsersStore = {
  async getByEmail(email: string): Promise<AuthUser | undefined> {
    await ensureSchema();
    const { rows } =
      await sql`SELECT * FROM auth_users WHERE lower(email) = ${email.toLowerCase()}`;
    return rows[0] as AuthUser | undefined;
  },

  async getById(id: number): Promise<AuthUser | undefined> {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM auth_users WHERE id = ${id}`;
    return rows[0] as AuthUser | undefined;
  },

  async getAll(): Promise<Omit<AuthUser, 'password_hash'>[]> {
    await ensureSchema();
    const { rows } =
      await sql`SELECT id, email, name, role, created_at FROM auth_users ORDER BY email`;
    return rows as Omit<AuthUser, 'password_hash'>[];
  },

  async create(email: string, password: string, name?: string): Promise<AuthUser> {
    await ensureSchema();
    const existing = await this.getByEmail(email);
    if (existing) throw new Error('An account with this email already exists.');

    const password_hash = await bcrypt.hash(password, 10);
    const role = autoAdminEmails().includes(email.toLowerCase()) ? 'Admin' : 'Member';
    const created_at = new Date().toISOString();

    const { rows } = await sql`
      INSERT INTO auth_users (email, password_hash, name, role, created_at)
      VALUES (${email.toLowerCase()}, ${password_hash}, ${name ?? null}, ${role}, ${created_at})
      RETURNING *
    `;

    return rows[0] as AuthUser;
  },

  async verifyPassword(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.getByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    return ok ? user : null;
  },

  async updateName(id: number, name: string): Promise<AuthUser | undefined> {
    await ensureSchema();
    const { rows } = await sql`
      UPDATE auth_users SET name = ${name} WHERE id = ${id} RETURNING *
    `;
    return rows[0] as AuthUser | undefined;
  },

  async updateRole(
    id: number,
    role: string
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; message: string }> {
    const roleRow = await rolesStore.getByName(role);
    if (!roleRow) return { ok: false, message: `No such role: ${role}` };

    await ensureSchema();
    const { rows } = await sql`
      UPDATE auth_users SET role = ${roleRow.name} WHERE id = ${id} RETURNING *
    `;
    if (!rows[0]) return { ok: false, message: 'Account not found.' };
    return { ok: true, user: rows[0] as AuthUser };
  },

  async updatePassword(
    id: number,
    newPassword: string
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const user = await this.getById(id);
    if (!user) return { ok: false, message: 'Account not found.' };

    await ensureSchema();
    const password_hash = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE auth_users SET password_hash = ${password_hash} WHERE id = ${id}`;
    return { ok: true };
  },

  // Admin-only password reset by email — there's no email-based self-service
  // flow yet, so an already-authenticated admin sets the new password directly.
  async setPassword(email: string, newPassword: string): Promise<boolean> {
    await ensureSchema();
    const password_hash = await bcrypt.hash(newPassword, 10);
    const { rowCount } =
      await sql`UPDATE auth_users SET password_hash = ${password_hash} WHERE lower(email) = ${email.toLowerCase()}`;
    return (rowCount ?? 0) > 0;
  },

  async remove(id: number): Promise<boolean> {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM auth_users WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};
