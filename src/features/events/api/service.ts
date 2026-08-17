import { apiClient } from '@/lib/api-client';
import type {
  Event,
  EventFilters,
  EventsResponse,
  EventResponse,
  EventMutationPayload
} from './types';

function toQueryString(filters: EventFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.type) params.set('type', filters.type);
  if (filters.is_past) params.set('is_past', filters.is_past);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export async function getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
  return apiClient<EventsResponse>(`/events?${toQueryString(filters)}`);
}

export async function getEventById(id: number): Promise<EventResponse> {
  return apiClient<EventResponse>(`/events/${id}`);
}

export async function createEvent(data: EventMutationPayload) {
  return apiClient<{ success: boolean; message: string; event: Event }>('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateEvent(id: number, data: EventMutationPayload) {
  return apiClient<{ success: boolean; message: string; event: Event }>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteEvent(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/events/${id}`, { method: 'DELETE' });
}
