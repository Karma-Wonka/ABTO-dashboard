'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { festivalsQueryOptions } from '../api/queries';
import { deleteFestivalMutation } from '../api/mutations';

export function FestivalTable() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data } = useSuspenseQuery(festivalsQueryOptions({ search: search || undefined }));
  const rows = data.festivals ?? [];
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteFestivalMutation,
    onSuccess: () => {
      toast.success('Festival deleted');
      setPendingDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete');
      setPendingDelete(null);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Festival Calendar ({rows.length})</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between gap-4'>
          <Input
            placeholder='Search festivals...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-sm'
          />
          <Button onClick={() => router.push('/dashboard/festivals/new')}>
            <Icons.add className='mr-2 h-4 w-4' /> Add Festival
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
              <TableHead>Place</TableHead>
              <TableHead>Dzongkhag</TableHead>
              <TableHead>2025</TableHead>
              <TableHead>2026</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.display_order}</TableCell>
                <TableCell className='font-medium'>{f.name}</TableCell>
                <TableCell>{f.place}</TableCell>
                <TableCell>{f.dzongkhag}</TableCell>
                <TableCell>{f.date_2025 ?? '—'}</TableCell>
                <TableCell>{f.date_2026 ?? '—'}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => router.push(`/dashboard/festivals/${f.id}`)}
                  >
                    <Icons.edit className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => setPendingDelete(f.id)}>
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className='text-muted-foreground text-center'>
                  No festivals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
