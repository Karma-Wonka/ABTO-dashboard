'use client';

import { useRef } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { festivalCalendarPdfOptions } from '../api/queries';
import {
  uploadFestivalCalendarPdfMutation,
  removeFestivalCalendarPdfMutation
} from '../api/mutations';

// Single-slot upload — the signed Festival Calendar PDF, stored as a
// private R2 object key under "Festival Calender/". Members see it on the
// public site's /festivals page via a link the web app signs itself.
export function FestivalCalendarPdfCard() {
  const { data } = useSuspenseQuery(festivalCalendarPdfOptions());
  const inputRef = useRef<HTMLInputElement>(null);
  const calendar = data.calendar;
  const hasPdf = !!calendar?.pdf_key;

  const uploadMutation = useMutation({
    ...uploadFestivalCalendarPdfMutation,
    onSuccess: () =>
      toast.success('Signed calendar PDF updated — live on the site within a minute'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to upload the PDF')
  });

  const removeMutation = useMutation({
    ...removeFestivalCalendarPdfMutation,
    onSuccess: () => toast.success('Signed calendar PDF removed'),
    onError: () => toast.error('Failed to remove the calendar PDF')
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Signed Festival Calendar (PDF)</CardTitle>
        <CardDescription>
          Members see this on the public Festival Calendar page. Uploading a new file replaces it.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-wrap items-center gap-3'>
        {calendar?.viewUrl ? (
          <a
            href={calendar.viewUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary text-sm underline underline-offset-2'
          >
            View current PDF
          </a>
        ) : (
          <span className='text-muted-foreground text-sm'>No PDF uploaded yet.</span>
        )}
        <input
          ref={inputRef}
          type='file'
          accept='application/pdf'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
            e.target.value = '';
          }}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          isLoading={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Icons.upload className='mr-2 h-4 w-4' />
          {hasPdf ? 'Replace PDF' : 'Upload PDF'}
        </Button>
        {hasPdf && (
          <Button
            variant='ghost'
            size='sm'
            disabled={removeMutation.isPending}
            onClick={() => removeMutation.mutate()}
          >
            Remove
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
