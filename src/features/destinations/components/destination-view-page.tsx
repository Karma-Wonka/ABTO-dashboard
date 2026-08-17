'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { Destination } from '../api/types';
import DestinationForm from './destination-form';
import { destinationByIdOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function DestinationViewPage({ destinationId }: { destinationId: string }) {
  const { isAdmin, isLoading } = useRole();
  if (isLoading) return null;
  if (!isAdmin) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can edit travel destinations.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (destinationId === 'new') {
    return <DestinationForm initialData={null} pageTitle='New Destination' />;
  }
  return <EditDestinationView destinationId={Number(destinationId)} />;
}

function EditDestinationView({ destinationId }: { destinationId: number }) {
  const { data } = useSuspenseQuery(destinationByIdOptions(destinationId));
  if (!data?.success || !data?.destination) notFound();
  return (
    <DestinationForm initialData={data.destination as Destination} pageTitle='Edit Destination' />
  );
}
