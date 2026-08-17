'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { Event } from '../api/types';
import EventForm from './event-form';
import { eventByIdOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function EventViewPage({ eventId }: { eventId: string }) {
  const { can, isLoading } = useRole();
  if (isLoading) return null;
  if (!can('events:write')) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can manage events.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (eventId === 'new') {
    return <EventForm initialData={null} pageTitle='Add Event' />;
  }
  return <EditEventView eventId={Number(eventId)} />;
}

function EditEventView({ eventId }: { eventId: number }) {
  const { data } = useSuspenseQuery(eventByIdOptions(eventId));
  if (!data?.success || !data?.event) notFound();
  return <EventForm initialData={data.event as Event} pageTitle='Edit Event' />;
}
