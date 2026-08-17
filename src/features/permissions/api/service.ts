import { apiClient } from '@/lib/api-client';
import type {
  Permission,
  PermissionMutationPayload,
  PermissionsResponse,
  PermissionResponse
} from './types';

export async function getPermissions(): Promise<PermissionsResponse> {
  return apiClient<PermissionsResponse>('/permissions');
}

export async function getPermissionById(id: number): Promise<PermissionResponse> {
  return apiClient<PermissionResponse>(`/permissions/${id}`);
}

export async function createPermission(data: PermissionMutationPayload) {
  return apiClient<{ success: boolean; message: string; permission: Permission }>('/permissions', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updatePermission(id: number, data: PermissionMutationPayload) {
  return apiClient<{ success: boolean; message: string; permission: Permission }>(
    `/permissions/${id}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
}

export async function deletePermission(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/permissions/${id}`, {
    method: 'DELETE'
  });
}
