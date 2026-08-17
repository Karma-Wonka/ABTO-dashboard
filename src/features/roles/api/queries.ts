import { queryOptions } from '@tanstack/react-query';
import { getRoles, getRoleById } from './service';
import type { Role } from './types';

export type { Role };

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: number) => [...roleKeys.all, 'detail', id] as const
};

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: roleKeys.list(),
    queryFn: () => getRoles()
  });

export const roleByIdOptions = (id: number) =>
  queryOptions({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRoleById(id)
  });
