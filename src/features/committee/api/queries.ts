import { queryOptions } from '@tanstack/react-query';
import { getCommittee, getCommitteeMemberById } from './service';
import type { CommitteeFilters } from './types';

export const committeeKeys = {
  all: ['committee'] as const,
  list: (filters: CommitteeFilters) => [...committeeKeys.all, 'list', filters] as const,
  detail: (id: number) => [...committeeKeys.all, 'detail', id] as const
};

export const committeeQueryOptions = (filters: CommitteeFilters = {}) =>
  queryOptions({
    queryKey: committeeKeys.list(filters),
    queryFn: () => getCommittee(filters)
  });

export const committeeByIdOptions = (id: number) =>
  queryOptions({
    queryKey: committeeKeys.detail(id),
    queryFn: () => getCommitteeMemberById(id)
  });
