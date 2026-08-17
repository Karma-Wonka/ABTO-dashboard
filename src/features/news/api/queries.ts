import { queryOptions } from '@tanstack/react-query';
import { getNews, getNewsById } from './service';
import type { NewsPost, NewsFilters } from './types';

export type { NewsPost };

export const newsKeys = {
  all: ['news'] as const,
  list: (filters: NewsFilters) => [...newsKeys.all, 'list', filters] as const,
  detail: (id: number) => [...newsKeys.all, 'detail', id] as const
};

export const newsQueryOptions = (filters: NewsFilters = {}) =>
  queryOptions({
    queryKey: newsKeys.list(filters),
    queryFn: () => getNews(filters)
  });

export const newsByIdOptions = (id: number) =>
  queryOptions({
    queryKey: newsKeys.detail(id),
    queryFn: () => getNewsById(id)
  });
