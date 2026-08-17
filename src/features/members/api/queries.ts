import { queryOptions } from '@tanstack/react-query';
import { getMembers, getMemberById, getMyMember } from './service';
import type { Member, MemberFilters } from './types';

export type { Member };

export const memberKeys = {
  all: ['members'] as const,
  list: (filters: MemberFilters) => [...memberKeys.all, 'list', filters] as const,
  detail: (id: number) => [...memberKeys.all, 'detail', id] as const,
  mine: () => [...memberKeys.all, 'mine'] as const
};

export const membersQueryOptions = (filters: MemberFilters = {}) =>
  queryOptions({
    queryKey: memberKeys.list(filters),
    queryFn: () => getMembers(filters)
  });

export const memberByIdOptions = (id: number) =>
  queryOptions({
    queryKey: memberKeys.detail(id),
    queryFn: () => getMemberById(id)
  });

export const myMemberOptions = () =>
  queryOptions({
    queryKey: memberKeys.mine(),
    queryFn: () => getMyMember()
  });
