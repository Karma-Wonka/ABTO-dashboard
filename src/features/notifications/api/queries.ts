import { queryOptions } from '@tanstack/react-query';
import { getNotifications } from './service';

export const notificationKeys = {
  all: ['notifications'] as const
};

// Polled rather than push-based — no websocket/SSE infra in this app yet.
// 30s is frequent enough for a small secretariat team without hammering
// the API.
export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: notificationKeys.all,
    queryFn: () => getNotifications(),
    refetchInterval: 30_000
  });
