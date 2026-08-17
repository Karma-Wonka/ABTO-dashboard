import { apiClient } from '@/lib/api-client';
import type { PasswordPayload } from '../schemas/profile';

export async function updateName(name: string) {
  return apiClient<{ success: boolean; message: string; name?: string }>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ name })
  });
}

// Bypasses apiClient here — a failed password change needs its specific
// server message (e.g. rate-limit) shown to the user, but apiClient
// discards the response body on non-2xx.
export async function updatePassword(data: PasswordPayload) {
  const res = await fetch('/api/auth/me/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = (await res.json()) as { success: boolean; message: string };
  if (!res.ok || !body.success) {
    throw new Error(body.message || 'Failed to update password');
  }
  return body;
}
