////////////////////////////////////////////////////////////////////////////////
// Postgres-backed user store — server-only, used by src/app/api/users/*
////////////////////////////////////////////////////////////////////////////////

import 'server-only';
import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { ensureSchema, sql } from '@/lib/db';

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
};

const ROLES = ['Developer', 'Designer', 'Manager', 'QA', 'DevOps', 'Product Owner'];
const STATUSES = ['Active', 'Inactive', 'Invited'];

function generateRandomUserData(): Omit<User, 'id'> {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: 'national' }),
    status: faker.helpers.arrayElement(STATUSES),
    role: faker.helpers.arrayElement(ROLES),
    created_at: faker.date.between({ from: '2022-01-01', to: '2023-12-31' }).toISOString(),
    updated_at: faker.date.recent().toISOString()
  };
}

async function seedIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (rows[0].count > 0) return;

  for (const u of Array.from({ length: 50 }, generateRandomUserData)) {
    await sql`
      INSERT INTO users (first_name, last_name, email, phone, status, role, created_at, updated_at)
      VALUES (${u.first_name}, ${u.last_name}, ${u.email}, ${u.phone}, ${u.status}, ${u.role}, ${u.created_at}, ${u.updated_at})
    `;
  }
}

export const fakeUsers = {
  async getAll({ roles = [], search }: { roles?: string[]; search?: string }) {
    await seedIfEmpty();
    const { rows } = await sql`SELECT * FROM users`;
    let users = rows as User[];

    if (roles.length > 0) {
      users = users.filter((user) => roles.includes(user.role));
    }

    if (search) {
      users = matchSorter(users, search, {
        keys: ['first_name', 'last_name', 'email']
      });
    }

    return users;
  },

  async createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    await ensureSchema();
    const now = new Date().toISOString();

    const { rows } = await sql`
      INSERT INTO users (first_name, last_name, email, phone, status, role, created_at, updated_at)
      VALUES (${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone}, ${data.status}, ${data.role}, ${now}, ${now})
      RETURNING *
    `;

    return {
      success: true,
      message: 'User created successfully',
      user: rows[0] as User
    };
  },

  async updateUser(id: number, data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    await ensureSchema();
    const { rows: existingRows } = await sql`SELECT * FROM users WHERE id = ${id}`;

    if (!existingRows[0]) {
      return { success: false, message: `User with ID ${id} not found` };
    }

    const updated_at = new Date().toISOString();
    const { rows } = await sql`
      UPDATE users SET first_name = ${data.first_name}, last_name = ${data.last_name}, email = ${data.email},
      phone = ${data.phone}, status = ${data.status}, role = ${data.role}, updated_at = ${updated_at} WHERE id = ${id}
      RETURNING *
    `;

    return {
      success: true,
      message: 'User updated successfully',
      user: rows[0] as User
    };
  },

  async deleteUser(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM users WHERE id = ${id}`;

    if ((rowCount ?? 0) === 0) {
      return { success: false, message: `User with ID ${id} not found` };
    }

    return {
      success: true,
      message: 'User deleted successfully'
    };
  },

  async getUsers({
    page = 1,
    limit = 10,
    roles,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    roles?: string | string[];
    search?: string;
    sort?: string;
  }) {
    const rolesArray = roles ? (Array.isArray(roles) ? roles : String(roles).split(/[.,]/)) : [];
    const allUsers = await this.getAll({
      roles: rolesArray,
      search
    });

    // Sorting
    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as {
          id: string;
          desc: boolean;
        }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          allUsers.sort((a, b) => {
            // Handle computed 'name' column
            const aVal =
              id === 'name' ? `${a.first_name} ${a.last_name}` : (a as Record<string, unknown>)[id];
            const bVal =
              id === 'name' ? `${b.first_name} ${b.last_name}` : (b as Record<string, unknown>)[id];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {
        // Invalid sort param — ignore
      }
    }

    const totalUsers = allUsers.length;

    const offset = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      message: 'Users from Postgres',
      total_users: totalUsers,
      offset,
      limit,
      users: paginatedUsers
    };
  }
};
