import { queryOptions } from '@tanstack/react-query';
import { getOverviewStats } from './service';
import type { OverviewStats } from './types';

export type { OverviewStats };

export const overviewKeys = {
  all: ['overview'] as const,
  stats: () => [...overviewKeys.all, 'stats'] as const
};

export const overviewStatsQueryOptions = () =>
  queryOptions({
    queryKey: overviewKeys.stats(),
    queryFn: () => getOverviewStats().then((res) => res.stats)
  });
