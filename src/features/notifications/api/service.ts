import { apiClient } from '@/lib/api-client';
import type { NotificationListResponse } from './types';

export async function getNotifications(): Promise<NotificationListResponse> {
  return apiClient<NotificationListResponse>('/notifications');
}

export async function markNotificationRead(id: number) {
  return apiClient<{ success: boolean }>(`/notifications/${id}`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return apiClient<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
}
