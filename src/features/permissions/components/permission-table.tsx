'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { permissionsQueryOptions } from '../api/queries';
import { deletePermissionMutation } from '../api/mutations';

export function PermissionTable() {
  const router = useRouter();
  const { data } = useSuspenseQuery(permissionsQueryOptions());
  const permissions = data.permissions;
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deletePermissionMutation,
    onSuccess: () => {
      toast.success('Permission deleted');
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete permission');
      setPendingDelete(null);
    }
  });

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-4'>
        <CardTitle>Permissions ({permissions.length})</CardTitle>
        <Button onClick={() => router.push('/dashboard/permissions/new')}>
          <Icons.plusCircle className='mr-2 h-4 w-4' /> Add Permission
        </Button>
      </CardHeader>
      <CardContent>
        <AlertModal
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => pendingDelete !== null && deleteMutation.mutate(pendingDelete)}
          loading={deleteMutation.isPending}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className='font-medium'>
                  {permission.key}
                  {permission.is_system && (
                    <Badge variant='outline' className='ml-2 text-xs'>
                      system
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{permission.resource}</TableCell>
                <TableCell>{permission.action}</TableCell>
                <TableCell className='text-muted-foreground'>
                  {permission.description || '—'}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      render={<Button variant='ghost' className='h-8 w-8 p-0' />}
                    >
                      <span className='sr-only'>Open menu</span>
                      <Icons.ellipsis className='h-4 w-4' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/permissions/${permission.id}`)}
                      >
                        <Icons.edit className='mr-2 h-4 w-4' /> Edit
                      </DropdownMenuItem>
                      {!permission.is_system && (
                        <DropdownMenuItem onClick={() => setPendingDelete(permission.id)}>
                          <Icons.trash className='mr-2 h-4 w-4' /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {permissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground text-center'>
                  No permissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function PermissionTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-64 w-full rounded-lg' />
    </div>
  );
}
