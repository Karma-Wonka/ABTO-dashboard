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

// Multipart upload — bypasses apiClient (which always sets
// Content-Type: application/json) since the browser needs to set its own
// multipart boundary.
export async function uploadFestivalCalendarPdf(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/festivals/pdf', { method: 'POST', body: formData });
  const data = (await res.json()) as FestivalCalendarPdfResponse & { message?: string };
  if (!res.ok || !data.success) throw new Error(data.message ?? 'Upload failed');
  return data;
}

export async function removeFestivalCalendarPdf() {
  return apiClient<{ success: boolean; message: string }>('/festivals/pdf', { method: 'DELETE' });
}
