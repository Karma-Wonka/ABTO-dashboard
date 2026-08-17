'use client';

// ============================================================
// Shared row actions for permission-gated DataTable columns
// (Events, News, Documents) — view is open to any signed-in
// user; edit needs `editPermission`, delete needs
// `deletePermission`. Renders nothing if the caller has neither.
// ============================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Icons } from '@/components/icons';
import { useRole } from '@/hooks/use-role';

export function AdminRowActions<TDeleteResult = unknown>({
  id,
  basePath,
  editPermission,
  deletePermission,
  deleteMutationOptions
}: {
  id: number;
  basePath: string;
  editPermission: string;
  deletePermission: string;
  deleteMutationOptions: MutationOptions<TDeleteResult, Error, number>;
}) {
  const router = useRouter();
  const { can } = useRole();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteMutationOptions,
    onSuccess: (...args) => {
      toast.success('Deleted');
      setOpen(false);
      deleteMutationOptions.onSuccess?.(...args);
    },
    onError: () => toast.error('Delete failed')
  });

  const canEdit = can(editPermission);
  const canDelete = can(deletePermission);
  if (!canEdit && !canDelete) return null;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteMutation.mutate(id)}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>Open menu</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuGroup>
          {canEdit && (
            <DropdownMenuItem onClick={() => router.push(`${basePath}/${id}`)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Icons.trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
