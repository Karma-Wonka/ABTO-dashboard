import { apiClient } from '@/lib/api-client';
import type { OverviewStatsResponse } from './types';

export async function getOverviewStats(): Promise<OverviewStatsResponse> {
  return apiClient<OverviewStatsResponse>('/overview/stats');
}
