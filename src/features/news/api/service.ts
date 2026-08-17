import { apiClient } from '@/lib/api-client';
import type {
  NewsPost,
  NewsFilters,
  NewsListResponse,
  NewsResponse,
  NewsMutationPayload
} from './types';

function toQueryString(filters: NewsFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export async function getNews(filters: NewsFilters = {}): Promise<NewsListResponse> {
  return apiClient<NewsListResponse>(`/news?${toQueryString(filters)}`);
}

export async function getNewsById(id: number): Promise<NewsResponse> {
  return apiClient<NewsResponse>(`/news/${id}`);
}

export async function createNews(data: NewsMutationPayload) {
  return apiClient<{ success: boolean; message: string; post: NewsPost }>('/news', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateNews(id: number, data: NewsMutationPayload) {
  return apiClient<{ success: boolean; message: string; post: NewsPost }>(`/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteNews(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/news/${id}`, { method: 'DELETE' });
}
