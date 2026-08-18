// ============================================================
// Roles & Permissions store — server-only, Postgres-backed
// ============================================================
// Real, dynamic RBAC: roles are rows an admin can create/edit/delete,
// each with a set of permission keys attached. Server-side route guards
// (src/lib/rbac.ts) check permission keys, not role names — so a new
// custom role with `members:write` can actually edit members without
// needing to be literally called "admin".
//
// "Admin" and "Member" are seeded as is_system=true so the app always
// has at least one role that can manage itself; system roles can't be
// deleted or renamed, but their permission set can still be edited.
// Permission KEYS matching real route checks are also seeded as
// is_system=true so a route's string check never silently goes dead —
// those can't be deleted or have their key/resource/action changed,
// only their description.
// ============================================================
import 'server-only';
import { query, transaction } from '@/lib/db';

export type Permission = {
  id: number;
  key: string;
  resource: string;
  action: string;
  description: string;
  is_system: boolean;
  created_at: string;
};

export type Role = {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
};

const PERMISSIONS_SEED: Omit<Permission, 'id' | 'created_at'>[] = [
  {
    key: 'members:read',
    resource: 'members',
    action: 'read',
    description: 'View the member directory',
    is_system: true
  },
  {
    key: 'members:write',
    resource: 'members',
    action: 'write',
    description: 'Create and edit members',
    is_system: true
  },
  {
    key: 'members:delete',
    resource: 'members',
    action: 'delete',
    description: 'Delete members',
    is_system: true
  },
  {
    key: 'events:read',
    resource: 'events',
    action: 'read',
    description: 'View events',
    is_system: true
  },
  {
    key: 'events:write',
    resource: 'events',
    action: 'write',
    description: 'Create and edit events',
    is_system: true
  },
  {
    key: 'events:delete',
    resource: 'events',
    action: 'delete',
    description: 'Delete events',
    is_system: true
  },
  {
    key: 'news:read',
    resource: 'news',
    action: 'read',
    description: 'View news posts',
    is_system: true
  },
  {
    key: 'news:write',
    resource: 'news',
    action: 'write',
    description: 'Create and edit news posts',
    is_system: true
  },
  {
    key: 'news:delete',
    resource: 'news',
    action: 'delete',
    description: 'Delete news posts',
    is_system: true
  },
  {
    key: 'documents:read',
    resource: 'documents',
    action: 'read',
    description: 'View documents',
    is_system: true
  },
  {
    key: 'documents:write',
    resource: 'documents',
    action: 'write',
    description: 'Create and edit documents',
    is_system: true
  },
  {
    key: 'documents:delete',
    resource: 'documents',
    action: 'delete',
    description: 'Delete documents',
    is_system: true
  },
  {
    key: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'View the demo users list',
    is_system: true
  },
  {
    key: 'users:write',
    resource: 'users',
    action: 'write',
    description: 'Create and edit demo users',
    is_system: true
  },
  {
    key: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete demo users',
    is_system: true
  },
  {
    key: 'accounts:manage',
    resource: 'accounts',
    action: 'manage',
    description: 'Change sign-in account roles',
    is_system: true
  },
  {
    key: 'roles:manage',
    resource: 'roles',
    action: 'manage',
    description: 'Create, edit and delete roles and permissions',
    is_system: true
  },
  {
    key: 'committee:read',
    resource: 'committee',
    action: 'read',
    description: 'View the committee page',
    is_system: true
  },
  {
    key: 'committee:write',
    resource: 'committee',
    action: 'write',
    description: 'Create and edit committee members',
    is_system: true
  },
  {
    key: 'destinations:read',
    resource: 'destinations',
    action: 'read',
    description: 'View destinations',
    is_system: true
  },
  {
    key: 'destinations:write',
    resource: 'destinations',
    action: 'write',
    description: 'Create and edit destinations',
    is_system: true
  },
  {
    key: 'site-content:manage',
    resource: 'site-content',
    action: 'manage',
    description: 'Edit the public website content sections',
    is_system: true
  },
  {
    key: 'submissions:read',
    resource: 'submissions',
    action: 'read',
    description: 'View public form submissions',
    is_system: true
  },
  {
    key: 'media:upload',
    resource: 'media',
    action: 'upload',
    description: 'Upload images used on the public site',
    is_system: true
  },
  {
    key: 'festivals:read',
    resource: 'festivals',
    action: 'read',
    description: 'View the festival calendar',
    is_system: true
  },
  {
    key: 'festivals:write',
    resource: 'festivals',
    action: 'write',
    description: 'Create and edit festival calendar entries, and upload the signed PDF',
    is_system: true
  },
  {
    key: 'festivals:delete',
    resource: 'festivals',
    action: 'delete',
    description: 'Delete festival calendar entries',
    is_system: true
  }
];

// Matches current behavior exactly: Member is read-only on the public-facing
// ABTO content, plus self-service on their own directory listing. The demo
// Users (CRM) list and all Roles/Permissions/Accounts management stay
// Admin-only, same as before this migration.
const MEMBER_ROLE_PERMISSIONS = [
  'members:read',
  'events:read',
  'news:read',
  'documents:read',
  'committee:read',
  'destinations:read',
  'festivals:read'
];

let seeded: Promise<void> | undefined;

// Keeps the permissions table (and Admin/Member's grants) in sync with
// PERMISSIONS_SEED/MEMBER_ROLE_PERMISSIONS on every cold start — cheap
// no-op ON CONFLICT DO NOTHING once everything already exists, same
// "safe to re-run" idiom as ensureSchema(). This matters because the very
// first run does a one-time bulk INSERT (below); any permission key added
// to the source after that first run (e.g. a new entity's :read/:write/
// :delete) would otherwise never reach an already-seeded database.
async function backfillPermissions() {
  const now = new Date().toISOString();
  await transaction(async (client) => {
    for (const p of PERMISSIONS_SEED) {
      await client.query(
        `INSERT INTO permissions (key, resource, action, description, is_system, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (key) DO NOTHING`,
        [p.key, p.resource, p.action, p.description, p.is_system, now]
      );
    }

    const { rows: adminRows } = await client.query<{ id: number }>(
      `SELECT id FROM roles WHERE name = 'Admin'`
    );
    const { rows: memberRows } = await client.query<{ id: number }>(
      `SELECT id FROM roles WHERE name = 'Member'`
    );
    const adminId = adminRows[0]?.id;
    const memberId = memberRows[0]?.id;

    if (adminId) {
      for (const p of PERMISSIONS_SEED) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, id FROM permissions WHERE key = $2
           ON CONFLICT DO NOTHING`,
          [adminId, p.key]
        );
      }
    }
    if (memberId) {
      for (const key of MEMBER_ROLE_PERMISSIONS) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, id FROM permissions WHERE key = $2
           ON CONFLICT DO NOTHING`,
          [memberId, key]
        );
      }
    }
  });
}

function seedIfEmpty() {
  if (!seeded) {
    seeded = (async () => {
      const { rows } = await query<{ count: string }>('SELECT COUNT(*) as count FROM permissions');
      if (Number(rows[0].count) > 0) {
        await backfillPermissions();
        return;
      }

      const now = new Date().toISOString();

      await transaction(async (client) => {
        const permissionIds = new Map<string, number>();
        for (const p of PERMISSIONS_SEED) {
          const { rows } = await client.query<{ id: number }>(
            `INSERT INTO permissions (key, resource, action, description, is_system, created_at)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [p.key, p.resource, p.action, p.description, p.is_system, now]
          );
          permissionIds.set(p.key, rows[0].id);
        }

        const { rows: adminRows } = await client.query<{ id: number }>(
          `INSERT INTO roles (name, description, is_system, created_at, updated_at)
           VALUES ('Admin', 'ABTO secretariat — full read/write on every entity.', true, $1, $1) RETURNING id`,
          [now]
        );
        const { rows: memberRows } = await client.query<{ id: number }>(
          `INSERT INTO roles (name, description, is_system, created_at, updated_at)
           VALUES ('Member', 'A licensed tour operator — read-only, plus self-service on their own directory listing.', true, $1, $1) RETURNING id`,
          [now]
        );

        const adminId = adminRows[0].id;
        const memberId = memberRows[0].id;

        for (const p of PERMISSIONS_SEED) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [adminId, permissionIds.get(p.key)]
          );
        }
        for (const key of MEMBER_ROLE_PERMISSIONS) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [memberId, permissionIds.get(key)]
          );
        }
      });
    })();
  }
  return seeded;
}

type RoleRow = Omit<Role, 'permissions'> & { permissions: string[] | null };

function rowToRole(row: RoleRow): Role {
  return { ...row, permissions: row.permissions ?? [] };
}

const ROLE_SELECT = `
  SELECT r.*, COALESCE(array_agg(p.key) FILTER (WHERE p.key IS NOT NULL), '{}') AS permissions
  FROM roles r
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
  GROUP BY r.id
`;

export type RoleMutationPayload = { name: string; description: string };
export type PermissionMutationPayload = {
  key: string;
  resource: string;
  action: string;
  description: string;
};

export const rolesStore = {
  async getAll(): Promise<Role[]> {
    await seedIfEmpty();
    const { rows } = await query<RoleRow>(`${ROLE_SELECT} ORDER BY r.name`);
    return rows.map(rowToRole);
  },

  async getById(id: number): Promise<Role | undefined> {
    await seedIfEmpty();
    const { rows } = await query<RoleRow>(`${ROLE_SELECT} HAVING r.id = $1`, [id]);
    return rows[0] ? rowToRole(rows[0]) : undefined;
  },

  async getByName(name: string): Promise<Role | undefined> {
    await seedIfEmpty();
    const { rows } = await query<RoleRow>(`${ROLE_SELECT} HAVING lower(r.name) = $1`, [
      name.toLowerCase()
    ]);
    return rows[0] ? rowToRole(rows[0]) : undefined;
  },

  async create(data: RoleMutationPayload): Promise<Role> {
    const now = new Date().toISOString();
    const { rows } = await query<{ id: number }>(
      `INSERT INTO roles (name, description, is_system, created_at, updated_at)
       VALUES ($1, $2, false, $3, $3) RETURNING id`,
      [data.name, data.description, now]
    );
    return (await this.getById(rows[0].id)) as Role;
  },

  async update(id: number, data: RoleMutationPayload): Promise<Role | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;
    if (existing.is_system && data.name !== existing.name) {
      throw new Error('System roles cannot be renamed.');
    }
    const updated_at = new Date().toISOString();
    await query('UPDATE roles SET name = $1, description = $2, updated_at = $3 WHERE id = $4', [
      data.name,
      data.description,
      updated_at,
      id
    ]);
    return this.getById(id);
  },

  async setPermissions(id: number, permissionKeys: string[]): Promise<Role | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;

    await transaction(async (client) => {
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
      if (permissionKeys.length > 0) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, id FROM permissions WHERE key = ANY($2::text[])`,
          [id, permissionKeys]
        );
      }
      await client.query('UPDATE roles SET updated_at = $1 WHERE id = $2', [
        new Date().toISOString(),
        id
      ]);
    });

    return this.getById(id);
  },

  async remove(id: number): Promise<boolean | 'system'> {
    const existing = await this.getById(id);
    if (!existing) return false;
    if (existing.is_system) return 'system';

    const { rowCount } = await query('DELETE FROM roles WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
};

export const permissionsStore = {
  async getAll(): Promise<Permission[]> {
    await seedIfEmpty();
    const { rows } = await query<Permission>('SELECT * FROM permissions ORDER BY resource, action');
    return rows;
  },

  async getById(id: number): Promise<Permission | undefined> {
    await seedIfEmpty();
    const { rows } = await query<Permission>('SELECT * FROM permissions WHERE id = $1', [id]);
    return rows[0];
  },

  async getByKey(key: string): Promise<Permission | undefined> {
    await seedIfEmpty();
    const { rows } = await query<Permission>('SELECT * FROM permissions WHERE key = $1', [key]);
    return rows[0];
  },

  async create(data: PermissionMutationPayload): Promise<Permission> {
    const existing = await this.getByKey(data.key);
    if (existing) throw new Error('A permission with this key already exists.');

    const now = new Date().toISOString();
    const { rows } = await query<Permission>(
      `INSERT INTO permissions (key, resource, action, description, is_system, created_at)
       VALUES ($1, $2, $3, $4, false, $5) RETURNING *`,
      [data.key, data.resource, data.action, data.description, now]
    );
    return rows[0];
  },

  async update(id: number, data: PermissionMutationPayload): Promise<Permission | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;
    if (
      existing.is_system &&
      (data.key !== existing.key ||
        data.resource !== existing.resource ||
        data.action !== existing.action)
    ) {
      throw new Error('The key, resource, and action of a system permission cannot be changed.');
    }
    const { rows } = await query<Permission>(
      `UPDATE permissions SET key = $1, resource = $2, action = $3, description = $4 WHERE id = $5 RETURNING *`,
      [data.key, data.resource, data.action, data.description, id]
    );
    return rows[0];
  },

  async remove(id: number): Promise<boolean | 'system'> {
    const existing = await this.getById(id);
    if (!existing) return false;
    if (existing.is_system) return 'system';

    const { rowCount } = await query('DELETE FROM permissions WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
};

/** Permission keys granted to `roleName`, or [] if the role doesn't exist. */
export async function getPermissionsForRole(roleName: string): Promise<string[]> {
  const role = await rolesStore.getByName(roleName);
  return role?.permissions ?? [];
}
