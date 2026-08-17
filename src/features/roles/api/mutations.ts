import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createRole, updateRole, setRolePermissions, deleteRole } from './service';
import { roleKeys } from './queries';
import type { RoleMutationPayload, SetPermissionsPayload } from './types';

export const createRoleMutation = mutationOptions({
  mutationFn: (data: RoleMutationPayload) => createRole(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: roleKeys.all })
});

export const updateRoleMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: RoleMutationPayload }) =>
    updateRole(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: roleKeys.all })
});

export const setRolePermissionsMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: SetPermissionsPayload }) =>
    setRolePermissions(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: roleKeys.all })
});

export const deleteRoleMutation = mutationOptions({
  mutationFn: (id: number) => deleteRole(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: roleKeys.all })
});
