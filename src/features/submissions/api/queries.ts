import { queryOptions } from '@tanstack/react-query';
import { getSubmissions } from './service';
import type { SubmissionFilters } from './types';

export const submissionKeys = {
  all: ['submissions'] as const,
  list: (filters: SubmissionFilters) => [...submissionKeys.all, 'list', filters] as const
};

export const submissionsQueryOptions = (filters: SubmissionFilters = {}) =>
  queryOptions({
    queryKey: submissionKeys.list(filters),
    queryFn: () => getSubmissions(filters)
  });
