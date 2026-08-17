import { apiClient } from '@/lib/api-client';
import type {
  Role,
  RoleMutationPayload,
  RolesResponse,
  RoleResponse,
  SetPermissionsPayload
} from './types';

export async function getRoles(): Promise<RolesResponse> {
  return apiClient<RolesResponse>('/roles');
}

export async function getRoleById(id: number): Promise<RoleResponse> {
  return apiClient<RoleResponse>(`/roles/${id}`);
}

export async function createRole(data: RoleMutationPayload) {
  return apiClient<{ success: boolean; message: string; role: Role }>('/roles', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateRole(id: number, data: RoleMutationPayload) {
  return apiClient<{ success: boolean; message: string; role: Role }>(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function setRolePermissions(id: number, data: SetPermissionsPayload) {
  return apiClient<{ success: boolean; message: string; role: Role }>(`/roles/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteRole(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/roles/${id}`, { method: 'DELETE' });
}
