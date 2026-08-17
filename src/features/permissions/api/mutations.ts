import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createPermission, updatePermission, deletePermission } from './service';
import { permissionKeys } from './queries';
import { roleKeys } from '@/features/roles/api/queries';
import type { PermissionMutationPayload } from './types';

export const createPermissionMutation = mutationOptions({
  mutationFn: (data: PermissionMutationPayload) => createPermission(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: permissionKeys.all })
});

export const updatePermissionMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: PermissionMutationPayload }) =>
    updatePermission(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: permissionKeys.all });
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});

export const deletePermissionMutation = mutationOptions({
  mutationFn: (id: number) => deletePermission(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: permissionKeys.all });
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});
