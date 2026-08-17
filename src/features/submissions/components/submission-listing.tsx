'use client';

import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { submissionsQueryOptions } from '../api/queries';
import { deleteSubmissionMutation } from '../api/mutations';
import type { Submission } from '../api/types';

async function openDocument(key: string) {
  try {
    const res = await fetch(`/api/uploads/sign?key=${encodeURIComponent(key)}`);
    const result = await res.json().catch(() => ({ success: false, message: '' }));
    if (!res.ok || !result.success) {
      toast.error(result.message || 'Could not open document');
      return;
    }
    window.open(result.url, '_blank', 'noopener,noreferrer');
  } catch {
    toast.error('Could not open document');
  }
}

export function SubmissionTable() {
  const { data } = useSuspenseQuery(submissionsQueryOptions());
  const submissions = data.submissions ?? [];
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    ...deleteSubmissionMutation,
    onSuccess: () => {
      toast.success('Submission deleted');
      setPendingDelete(null);
    },
    onError: () => toast.error('Delete failed')
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions ({submissions.length})</CardTitle>
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
              <TableHead>Kind</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Badge variant='secondary'>
                    {s.kind === 'contact' ? 'Contact' : 'Membership'}
                  </Badge>
                </TableCell>
                <TableCell className='font-medium'>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='sm' onClick={() => setViewing(s)}>
                    View
                  </Button>
                  <Button variant='ghost' size='sm' onClick={() => setPendingDelete(s.id)}>
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground text-center'>
                  No submissions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent>
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.name}</SheetTitle>
                <SheetDescription>
                  {viewing.kind === 'contact' ? 'Contact form' : 'Membership application'} ·{' '}
                  {new Date(viewing.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>
              <div className='space-y-4 p-4 text-sm'>
                <p>
                  <strong>Email:</strong> {viewing.email}
                </p>
                {viewing.phone && (
                  <p>
                    <strong>Phone:</strong> {viewing.phone}
                  </p>
                )}
                {viewing.company && (
                  <p>
                    <strong>Company:</strong> {viewing.company}
                  </p>
                )}
                {viewing.message && (
                  <div>
                    <strong>Message:</strong>
                    <p className='mt-1 whitespace-pre-wrap text-muted-foreground'>
                      {viewing.message}
                    </p>
                  </div>
                )}
                {(typeof viewing.payload?.licenceFileKey === 'string' ||
                  typeof viewing.payload?.feeFileKey === 'string') && (
                  <div>
                    <strong>Documents:</strong>
                    <div className='mt-1 flex flex-wrap gap-2'>
                      {typeof viewing.payload?.licenceFileKey === 'string' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => openDocument(viewing.payload.licenceFileKey as string)}
                        >
                          View licence document
                        </Button>
                      )}
                      {typeof viewing.payload?.feeFileKey === 'string' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => openDocument(viewing.payload.feeFileKey as string)}
                        >
                          View deposit slip
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {Object.keys(viewing.payload ?? {}).length > 0 && (
                  <div>
                    <strong>Additional Details:</strong>
                    <pre className='mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs'>
                      {JSON.stringify(viewing.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
