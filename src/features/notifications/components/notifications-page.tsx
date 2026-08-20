'use client';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { NotificationCard } from '@/components/ui/notification-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsQueryOptions } from '../api/queries';
import { markNotificationReadMutation, markAllNotificationsReadMutation } from '../api/mutations';
import type { Notification } from '../api/types';

export default function NotificationsPage() {
  const { data, isLoading } = useQuery(notificationsQueryOptions());
  const router = useRouter();
  const markReadMutation = useMutation(markNotificationReadMutation);
  const markAllReadMutation = useMutation(markAllNotificationsReadMutation);

  const notifications = data?.notifications ?? [];
  const count = data?.unreadCount ?? 0;
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  const renderList = (items: Notification[]) => {
    if (isLoading) {
      return <p className='text-muted-foreground py-16 text-center text-sm'>Loading…</p>;
    }
    if (items.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-16'>
          <Icons.notification className='text-muted-foreground/40 mb-3 h-10 w-10' />
          <p className='text-muted-foreground text-sm'>No notifications</p>
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-2'>
        {items.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={String(notification.id)}
            title={notification.title}
            body={notification.body ?? ''}
            status={notification.is_read ? 'read' : 'unread'}
            createdAt={notification.created_at}
            actions={
              notification.link
                ? [{ id: 'view', label: 'View', type: 'redirect', style: 'primary' as const }]
                : []
            }
            onMarkAsRead={(id) => markReadMutation.mutate(Number(id))}
            onAction={() => {
              markReadMutation.mutate(notification.id);
              if (notification.link) router.push(notification.link);
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      pageTitle='Notifications'
      pageDescription='View and manage all your notifications.'
      pageHeaderAction={
        count > 0 ? (
          <Button variant='outline' size='sm' onClick={() => markAllReadMutation.mutate()}>
            Mark all as read
          </Button>
        ) : undefined
      }
    >
      <Tabs defaultValue='all'>
        <TabsList>
          <TabsTrigger value='all'>All ({notifications.length})</TabsTrigger>
          <TabsTrigger value='unread'>Unread ({unreadNotifications.length})</TabsTrigger>
          <TabsTrigger value='read'>Read ({readNotifications.length})</TabsTrigger>
        </TabsList>
        <TabsContent value='all' className='mt-4'>
          {renderList(notifications)}
        </TabsContent>
        <TabsContent value='unread' className='mt-4'>
          {renderList(unreadNotifications)}
        </TabsContent>
        <TabsContent value='read' className='mt-4'>
          {renderList(readNotifications)}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
