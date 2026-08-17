import { queryOptions } from '@tanstack/react-query';
import { getPermissions, getPermissionById } from './service';
import type { Permission } from './types';

export type { Permission };

export const permissionKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionKeys.all, 'list'] as const,
  detail: (id: number) => [...permissionKeys.all, 'detail', id] as const
};

export const permissionsQueryOptions = () =>
  queryOptions({
    queryKey: permissionKeys.list(),
    queryFn: () => getPermissions()
  });

export const permissionByIdOptions = (id: number) =>
  queryOptions({
    queryKey: permissionKeys.detail(id),
    queryFn: () => getPermissionById(id)
  });
