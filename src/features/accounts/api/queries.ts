import { queryOptions } from '@tanstack/react-query';
import { getAccounts } from './service';
import type { Account } from './types';

export type { Account };

export const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const
};

export const accountsQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.list(),
    queryFn: () => getAccounts()
  });
