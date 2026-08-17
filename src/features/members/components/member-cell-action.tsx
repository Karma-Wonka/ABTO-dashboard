'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteMemberMutation } from '../api/mutations';
import type { Member } from '../api/types';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRole } from '@/hooks/use-role';
import { toast } from 'sonner';

export function MemberCellAction({
  data,
  canWrite,
  isMine
}: {
  data: Member;
  canWrite: boolean;
  isMine: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { can } = useRole();
  const canDelete = can('members:delete');

  const deleteMutation = useMutation({
    ...deleteMemberMutation,
    onSuccess: () => {
      toast.success('Member deleted');
      setOpen(false);
    },
    onError: () => toast.error('Failed to delete member')
  });

  if (!canWrite && !isMine) return null;

  return (
    <>
      {canDelete && (
        <AlertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => deleteMutation.mutate(data.id)}
          loading={deleteMutation.isPending}
        />
      )}
      {canWrite ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/members/${data.id}`)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Icons.trash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push(`/dashboard/members/${data.id}`)}
        >
          <Icons.edit className='mr-2 h-4 w-4' /> Edit my listing
        </Button>
      )}
    </>
  );
}
