'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { CommitteeMember } from '../api/types';
import CommitteeForm from './committee-form';
import { committeeByIdOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function CommitteeViewPage({ committeeId }: { committeeId: string }) {
  const { isAdmin, isLoading } = useRole();
  if (isLoading) return null;
  if (!isAdmin) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can edit the Executive Committee.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (committeeId === 'new') {
    return <CommitteeForm initialData={null} pageTitle='New Committee Seat' />;
  }
  return <EditCommitteeView committeeId={Number(committeeId)} />;
}

function EditCommitteeView({ committeeId }: { committeeId: number }) {
  const { data } = useSuspenseQuery(committeeByIdOptions(committeeId));
  if (!data?.success || !data?.member) notFound();
  return (
    <CommitteeForm initialData={data.member as CommitteeMember} pageTitle='Edit Committee Seat' />
  );
}
