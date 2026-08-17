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
import { destinationsQueryOptions } from '../api/queries';
import { deleteDestinationMutation } from '../api/mutations';

const KIND_LABELS: Record<string, string> = {
  place: 'Place',
  druk_air: 'Druk Air',
  tashi_air: 'Tashi Air'
};

export function DestinationTable() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data } = useSuspenseQuery(destinationsQueryOptions({ search: search || undefined }));
  const rows = data.destinations ?? [];
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteDestinationMutation,
    onSuccess: () => {
      toast.success('Destination deleted');
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
          placeholder='Search destinations...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <Button onClick={() => router.push('/dashboard/destinations/new')}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Destination
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
            <TableHead>Name</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Tagline / Country</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell className='font-medium'>{d.name}</TableCell>
              <TableCell>
                <Badge variant='secondary'>{KIND_LABELS[d.kind] ?? d.kind}</Badge>
              </TableCell>
              <TableCell>{d.tagline}</TableCell>
              <TableCell>{d.seat_order}</TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.push(`/dashboard/destinations/${d.id}`)}
                >
                  <Icons.edit className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='icon' onClick={() => setPendingDelete(d.id)}>
                  <Icons.trash className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className='text-muted-foreground text-center'>
                No destinations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
