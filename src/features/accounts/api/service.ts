// ============================================================
// Accounts Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Queries (queries.ts) and components import from here — they never change.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Account,
  AccountsResponse,
  RoleAssignmentPayload,
  ResetPasswordPayload
} from './types';

export async function getAccounts(): Promise<AccountsResponse> {
  return apiClient<AccountsResponse>('/accounts');
}

// Bypasses apiClient — a failed role change needs its specific server
// message ("You cannot change your own role.") shown to the user.
export async function updateAccountRole(id: number, data: RoleAssignmentPayload) {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = (await res.json()) as { success: boolean; message: string; account?: Account };
  if (!res.ok || !body.success) {
    throw new Error(body.message || 'Failed to update role');
  }
  return body;
}

export async function deleteAccount(id: number) {
  const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
  const body = (await res.json()) as { success: boolean; message: string };
  if (!res.ok || !body.success) {
    throw new Error(body.message || 'Failed to delete account');
  }
  return body;
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>('/accounts/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
