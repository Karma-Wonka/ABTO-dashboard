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
import { rolesQueryOptions } from '../api/queries';
import { deleteRoleMutation } from '../api/mutations';

export function RoleTable() {
  const router = useRouter();
  const { data } = useSuspenseQuery(rolesQueryOptions());
  const roles = data.roles;
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteRoleMutation,
    onSuccess: () => {
      toast.success('Role deleted');
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role');
      setPendingDelete(null);
    }
  });

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-4'>
        <CardTitle>Roles ({roles.length})</CardTitle>
        <Button onClick={() => router.push('/dashboard/roles/new')}>
          <Icons.plusCircle className='mr-2 h-4 w-4' /> Add Role
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
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className='font-medium'>
                  {role.name}
                  {role.is_system && (
                    <Badge variant='outline' className='ml-2 text-xs'>
                      system
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground'>{role.description || '—'}</TableCell>
                <TableCell>{role.permissions.length}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      render={<Button variant='ghost' className='h-8 w-8 p-0' />}
                    >
                      <span className='sr-only'>Open menu</span>
                      <Icons.ellipsis className='h-4 w-4' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/roles/${role.id}`)}>
                        <Icons.edit className='mr-2 h-4 w-4' /> Edit
                      </DropdownMenuItem>
                      {!role.is_system && (
                        <DropdownMenuItem onClick={() => setPendingDelete(role.id)}>
                          <Icons.trash className='mr-2 h-4 w-4' /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground text-center'>
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function RoleTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-64 w-full rounded-lg' />
    </div>
  );
}
