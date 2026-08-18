import { apiClient } from '@/lib/api-client';
import type {
  FestivalFilters,
  FestivalListResponse,
  FestivalResponse,
  FestivalMutationPayload,
  FestivalCalendarPdfResponse
} from './types';

function toQueryString(filters: FestivalFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  return params.toString();
}

export async function getFestivals(filters: FestivalFilters = {}): Promise<FestivalListResponse> {
  return apiClient<FestivalListResponse>(`/festivals?${toQueryString(filters)}`);
}

export async function getFestivalById(id: number): Promise<FestivalResponse> {
  return apiClient<FestivalResponse>(`/festivals/${id}`);
}

export async function createFestival(data: FestivalMutationPayload) {
  return apiClient<FestivalResponse & { message: string }>('/festivals', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateFestival(id: number, data: FestivalMutationPayload) {
  return apiClient<FestivalResponse & { message: string }>(`/festivals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteFestival(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/festivals/${id}`, {
    method: 'DELETE'
  });
}

export async function getFestivalCalendarPdf(): Promise<FestivalCalendarPdfResponse> {
  return apiClient<FestivalCalendarPdfResponse>('/festivals/pdf');
}

export async function setFestivalCalendarPdf(pdf_url: string | null) {
  return apiClient<FestivalCalendarPdfResponse & { message: string }>('/festivals/pdf', {
    method: 'PUT',
    body: JSON.stringify({ pdf_url })
  });
}
