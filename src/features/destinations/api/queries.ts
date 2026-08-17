import { queryOptions } from '@tanstack/react-query';
import { getDestinations, getDestinationById } from './service';
import type { DestinationFilters } from './types';

export const destinationKeys = {
  all: ['destinations'] as const,
  list: (filters: DestinationFilters) => [...destinationKeys.all, 'list', filters] as const,
  detail: (id: number) => [...destinationKeys.all, 'detail', id] as const
};

export const destinationsQueryOptions = (filters: DestinationFilters = {}) =>
  queryOptions({
    queryKey: destinationKeys.list(filters),
    queryFn: () => getDestinations(filters)
  });

export const destinationByIdOptions = (id: number) =>
  queryOptions({
    queryKey: destinationKeys.detail(id),
    queryFn: () => getDestinationById(id)
  });
