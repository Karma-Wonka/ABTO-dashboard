// ============================================================
// User Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Queries (queries.ts) and components import from here — they never change.
//
// Pattern: Route Handlers + ORM (Pattern 2)
// getUsers runs both server-side (RSC prefetch) and client-side (React
// Query refetch on pagination/filter change), so it must go over HTTP to
// the route handlers — the Postgres-backed store in
// src/constants/mock-api-users.ts is server-only and can't run in the browser.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { User, UserFilters, UsersResponse, UserMutationPayload } from './types';

function toQueryString(filters: UserFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.roles) params.set('roles', filters.roles);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  return apiClient<UsersResponse>(`/users?${toQueryString(filters)}`);
}

export async function createUser(data: UserMutationPayload) {
  return apiClient<{ success: boolean; message: string; user: User }>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateUser(id: number, data: UserMutationPayload) {
  return apiClient<{ success: boolean; message: string; user: User }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteUser(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/users/${id}`, {
    method: 'DELETE'
  });
}
