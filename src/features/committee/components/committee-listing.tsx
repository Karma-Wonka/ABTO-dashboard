'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { committeeQueryOptions } from '../api/queries';
import { deleteCommitteeMutation } from '../api/mutations';

export function CommitteeTable() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data } = useSuspenseQuery(committeeQueryOptions({ search: search || undefined }));
  const rows = data.committee ?? [];
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteCommitteeMutation,
    onSuccess: () => {
      toast.success('Committee member deleted');
      setPendingDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete');
      setPendingDelete(null);
    }
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <Input
          placeholder='Search committee...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <Button onClick={() => router.push('/dashboard/committee/new')}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Member
        </Button>
      </div>
      <AlertModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete !== null && deleteMutation.mutate(pendingDelete)}
        loading={deleteMutation.isPending}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.seat_order}</TableCell>
              <TableCell className='font-medium'>{m.is_vacant ? 'Vacant' : m.name}</TableCell>
              <TableCell>{m.title}</TableCell>
              <TableCell>
                <Badge variant={m.is_vacant ? 'outline' : 'secondary'}>
                  {m.is_vacant ? 'Vacant' : 'Filled'}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.push(`/dashboard/committee/${m.id}`)}
                >
                  <Icons.edit className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='icon' onClick={() => setPendingDelete(m.id)}>
                  <Icons.trash className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className='text-muted-foreground text-center'>
                No committee members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
