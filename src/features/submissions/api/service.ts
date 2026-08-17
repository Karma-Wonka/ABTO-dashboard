import { apiClient } from '@/lib/api-client';
import type { SubmissionFilters, SubmissionListResponse } from './types';

function toQueryString(filters: SubmissionFilters) {
  const params = new URLSearchParams();
  if (filters.kind) params.set('kind', filters.kind);
  return params.toString();
}

export async function getSubmissions(
  filters: SubmissionFilters = {}
): Promise<SubmissionListResponse> {
  return apiClient<SubmissionListResponse>(`/submissions?${toQueryString(filters)}`);
}

export async function deleteSubmission(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/submissions/${id}`, {
    method: 'DELETE'
  });
}
