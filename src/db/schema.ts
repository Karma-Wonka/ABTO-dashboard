import { pgTable, serial, text, real, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  photoUrl: text('photo_url').notNull(),
  category: text('category').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  status: text('status').notNull(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Auth (NextAuth Credentials provider) ---------------------------------

export const authUsers = pgTable('auth_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').notNull().default('member'),
  createdAt: text('created_at').notNull()
});

// ABTO content tables ------------------------------------------------

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website').notNull(),
  description: text('description').notNull(),
  specialties: text('specialties').notNull(),
  languages: text('languages').notNull(),
  memberSince: integer('member_since').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  capacity: integer('capacity').notNull(),
  isPast: integer('is_past').notNull().default(0),
  detailLink: text('detail_link'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  docType: text('doc_type').notNull(),
  size: text('size'),
  year: text('year'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Roles & permissions ---------------------------------------------------

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  description: text('description').notNull().default(''),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: text('created_at').notNull()
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);
