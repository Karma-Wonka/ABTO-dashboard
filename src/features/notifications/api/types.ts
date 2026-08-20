export type { Notification } from '@/constants/abto-data';

export type NotificationListResponse = {
  success: boolean;
  message?: string;
  notifications: import('@/constants/abto-data').Notification[];
  unreadCount: number;
};
