// ============================================================
// Member Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Queries (queries.ts) and components import from here — they never change.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Member,
  MemberFilters,
  MembersResponse,
  MemberResponse,
  MemberMutationPayload
} from './types';

function toQueryString(filters: MemberFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export async function getMembers(filters: MemberFilters = {}): Promise<MembersResponse> {
  return apiClient<MembersResponse>(`/members?${toQueryString(filters)}`);
}

export async function getMemberById(id: number): Promise<MemberResponse> {
  return apiClient<MemberResponse>(`/members/${id}`);
}

export async function getMyMember(): Promise<MemberResponse> {
  return apiClient<MemberResponse>('/members/me');
}

export async function createMember(data: MemberMutationPayload) {
  return apiClient<{ success: boolean; message: string; member: Member }>('/members', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateMember(id: number, data: MemberMutationPayload) {
  return apiClient<{ success: boolean; message: string; member: Member }>(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteMember(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/members/${id}`, {
    method: 'DELETE'
  });
}
