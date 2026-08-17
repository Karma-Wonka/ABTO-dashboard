'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { Member } from '../api/types';
import MemberForm from './member-form';
import { memberByIdOptions, myMemberOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function MemberViewPage({ memberId }: { memberId: string }) {
  const { can, isLoading } = useRole();
  const canWrite = can('members:write');

  if (memberId === 'new') {
    if (isLoading) return null;
    if (!canWrite) {
      return <NotAuthorized message='Only the secretariat can add a brand-new member listing.' />;
    }
    return <MemberForm initialData={null} pageTitle='Add Member' />;
  }

  return <EditMemberView memberId={Number(memberId)} canWrite={canWrite} isLoading={isLoading} />;
}

function EditMemberView({
  memberId,
  canWrite,
  isLoading
}: {
  memberId: number;
  canWrite: boolean;
  isLoading: boolean;
}) {
  const { data } = useSuspenseQuery(memberByIdOptions(memberId));
  const { data: mine } = useSuspenseQuery(myMemberOptions());

  if (!data?.success || !data?.member) {
    notFound();
  }

  if (isLoading) return null;

  const isMine = mine?.member?.id === memberId;
  if (!canWrite && !isMine) {
    return <NotAuthorized message='You can only edit your own listing.' />;
  }

  return (
    <MemberForm
      initialData={data.member as Member}
      pageTitle='Edit Member'
      restricted={!canWrite}
    />
  );
}

function NotAuthorized({ message }: { message: string }) {
  return (
    <Card className='mx-auto w-full max-w-lg'>
      <CardContent className='py-10 text-center'>
        <p className='text-lg font-medium'>Not authorized</p>
        <p className='text-muted-foreground mt-1 text-sm'>{message}</p>
      </CardContent>
    </Card>
  );
}
