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
import type { FestivalCalendarPdfSlot, FestivalCalendarSlotName } from '../api/types';

const SLOTS: { name: FestivalCalendarSlotName; label: string }[] = [
  { name: 'currentYear', label: 'Current Year' },
  { name: 'nextYear', label: 'Next Year' }
];

// Two-slot upload — the signed Festival Calendar PDFs for the current and
// next year, each stored as a private R2 object key under "Festival
// Calender/". Members see them on the public site's /festivals page via
// links the web app signs itself.
export function FestivalCalendarPdfCard() {
  const { data } = useSuspenseQuery(festivalCalendarPdfOptions());

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Signed Festival Calendar (PDF)</CardTitle>
        <CardDescription>
          Members see these on the public Festival Calendar page. Uploading a new file replaces the
          one in that slot. Up to 2 PDFs — one for the current year, one for next year.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {SLOTS.map((slot) => (
          <FestivalCalendarPdfSlotRow
            key={slot.name}
            slot={slot.name}
            label={slot.label}
            calendar={data.calendar[slot.name]}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function FestivalCalendarPdfSlotRow({
  slot,
  label,
  calendar
}: {
  slot: FestivalCalendarSlotName;
  label: string;
  calendar: FestivalCalendarPdfSlot;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPdf = !!calendar?.pdf_key;

  const uploadMutation = useMutation({
    ...uploadFestivalCalendarPdfMutation,
    onSuccess: (...args) => {
      uploadFestivalCalendarPdfMutation.onSuccess?.(...args);
      toast.success(`${label} calendar PDF updated — live on the site within a minute`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to upload the PDF')
  });

  const removeMutation = useMutation({
    ...removeFestivalCalendarPdfMutation,
    onSuccess: (...args) => {
      removeFestivalCalendarPdfMutation.onSuccess?.(...args);
      toast.success(`${label} calendar PDF removed`);
    },
    onError: () => toast.error('Failed to remove the calendar PDF')
  });

  return (
    <div className='flex flex-wrap items-center gap-3 border-b pb-4 last:border-0 last:pb-0'>
      <span className='w-28 shrink-0 text-sm font-medium'>{label}</span>
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
          if (file) uploadMutation.mutate({ file, slot });
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
          onClick={() => removeMutation.mutate(slot)}
        >
          Remove
        </Button>
      )}
    </div>
  );
}
