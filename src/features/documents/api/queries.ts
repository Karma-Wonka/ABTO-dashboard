import { queryOptions } from '@tanstack/react-query';
import { getDocuments, getDocumentById } from './service';
import type { Document, DocumentFilters } from './types';

export type { Document };

export const documentKeys = {
  all: ['documents'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.all, 'list', filters] as const,
  detail: (id: number) => [...documentKeys.all, 'detail', id] as const
};

export const documentsQueryOptions = (filters: DocumentFilters = {}) =>
  queryOptions({
    queryKey: documentKeys.list(filters),
    queryFn: () => getDocuments(filters)
  });

export const documentByIdOptions = (id: number) =>
  queryOptions({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocumentById(id)
  });
