import { queryOptions } from '@tanstack/react-query';
import { getEvents, getEventById } from './service';
import type { Event, EventFilters } from './types';

export type { Event };

export const eventKeys = {
  all: ['events'] as const,
  list: (filters: EventFilters) => [...eventKeys.all, 'list', filters] as const,
  detail: (id: number) => [...eventKeys.all, 'detail', id] as const
};

export const eventsQueryOptions = (filters: EventFilters = {}) =>
  queryOptions({
    queryKey: eventKeys.list(filters),
    queryFn: () => getEvents(filters)
  });

export const eventByIdOptions = (id: number) =>
  queryOptions({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id)
  });
