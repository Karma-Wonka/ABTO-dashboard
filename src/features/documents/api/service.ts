import { apiClient } from '@/lib/api-client';
import type {
  Document,
  DocumentFilters,
  DocumentsListResponse,
  DocumentResponse,
  DocumentMutationPayload
} from './types';

function toQueryString(filters: DocumentFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.kind) params.set('kind', filters.kind);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export async function getDocuments(filters: DocumentFilters = {}): Promise<DocumentsListResponse> {
  return apiClient<DocumentsListResponse>(`/documents?${toQueryString(filters)}`);
}

export async function getDocumentById(id: number): Promise<DocumentResponse> {
  return apiClient<DocumentResponse>(`/documents/${id}`);
}

export async function createDocument(data: DocumentMutationPayload) {
  return apiClient<{ success: boolean; message: string; document: Document }>('/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateDocument(id: number, data: DocumentMutationPayload) {
  return apiClient<{ success: boolean; message: string; document: Document }>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteDocument(id: number) {
  return apiClient<{ success: boolean; message: string }>(`/documents/${id}`, { method: 'DELETE' });
}
