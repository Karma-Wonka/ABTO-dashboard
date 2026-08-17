// ============================================================
// Site Content Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Queries (queries.ts) and components import from here — they never change.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { SiteContent, SiteContentResponse } from './types';

export async function getSiteContent(): Promise<SiteContentResponse> {
  return apiClient<SiteContentResponse>('/site-content');
}

export async function updateSiteContent(patch: Partial<SiteContent>): Promise<SiteContentResponse> {
  return apiClient<SiteContentResponse>('/site-content', {
    method: 'PUT',
    body: JSON.stringify(patch)
  });
}
