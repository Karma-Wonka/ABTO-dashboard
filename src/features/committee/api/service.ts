import { apiClient } from '@/lib/api-client';
import type {
  CommitteeFilters,
  CommitteeListResponse,
  CommitteeResponse,
  CommitteeMutationPayload
} from './types';

function toQueryString(filters: CommitteeFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  return params.toString();
}

export async function getCommittee(filters: CommitteeFilters = {}): Promise<CommitteeListResponse> {
  return apiClient<CommitteeListResponse>(`/committee?${toQueryString(filters)}`);
}

export async function getCommitteeMemberById(id: number): Promise<CommitteeResponse> {
  return apiClient<CommitteeResponse>(`/committee/${id}`);
}

export async function createCommitteeMember(data: CommitteeMutationPayload) {
  return apiClient<CommitteeResponse & { message: string }>('/committee', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCommitteeMember(id: number, data: CommitteeMutationPayload) {
  return apiClient<CommitteeResponse & { message: string }>(`/committee/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteCommitteeMember(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/committee/${id}`, {
    method: 'DELETE'
  });
}
