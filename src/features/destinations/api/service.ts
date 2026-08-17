import { apiClient } from '@/lib/api-client';
import type {
  DestinationFilters,
  DestinationListResponse,
  DestinationResponse,
  DestinationMutationPayload
} from './types';

function toQueryString(filters: DestinationFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.kind) params.set('kind', filters.kind);
  return params.toString();
}

export async function getDestinations(
  filters: DestinationFilters = {}
): Promise<DestinationListResponse> {
  return apiClient<DestinationListResponse>(`/destinations?${toQueryString(filters)}`);
}

export async function getDestinationById(id: number): Promise<DestinationResponse> {
  return apiClient<DestinationResponse>(`/destinations/${id}`);
}

export async function createDestination(data: DestinationMutationPayload) {
  return apiClient<DestinationResponse & { message: string }>('/destinations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateDestination(id: number, data: DestinationMutationPayload) {
  return apiClient<DestinationResponse & { message: string }>(`/destinations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteDestination(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/destinations/${id}`, {
    method: 'DELETE'
  });
}
