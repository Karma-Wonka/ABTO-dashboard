import { queryOptions } from '@tanstack/react-query';
import { getFestivals, getFestivalById, getFestivalCalendarPdf } from './service';
import type { FestivalFilters } from './types';

export const festivalKeys = {
  all: ['festivals'] as const,
  list: (filters: FestivalFilters) => [...festivalKeys.all, 'list', filters] as const,
  detail: (id: number) => [...festivalKeys.all, 'detail', id] as const,
  pdf: () => [...festivalKeys.all, 'pdf'] as const
};

export const festivalsQueryOptions = (filters: FestivalFilters = {}) =>
  queryOptions({
    queryKey: festivalKeys.list(filters),
    queryFn: () => getFestivals(filters)
  });

export const festivalByIdOptions = (id: number) =>
  queryOptions({
    queryKey: festivalKeys.detail(id),
    queryFn: () => getFestivalById(id)
  });

export const festivalCalendarPdfOptions = () =>
  queryOptions({
    queryKey: festivalKeys.pdf(),
    queryFn: () => getFestivalCalendarPdf()
  });
