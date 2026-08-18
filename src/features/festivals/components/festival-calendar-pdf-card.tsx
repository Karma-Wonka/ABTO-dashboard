'use client';

import { useRef, useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { festivalCalendarPdfOptions } from '../api/queries';
import { setFestivalCalendarPdfMutation } from '../api/mutations';

// Single-slot upload — the signed Festival Calendar PDF shown on the public
// site's /festivals page (members-only there). Uploading here immediately
// replaces whatever PDF is currently live.
export function FestivalCalendarPdfCard() {
  const { data } = useSuspenseQuery(festivalCalendarPdfOptions());
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pdfUrl = data.calendar?.pdf_url ?? null;

  const saveMutation = useMutation({
    ...setFestivalCalendarPdfMutation,
    onSuccess: () =>
      toast.success('Signed calendar PDF updated — live on the site within a minute'),
    onError: () => toast.error('Failed to update the calendar PDF')
  });

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      toast.error('Please choose a PDF file.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploaded = await res.json();
      if (!res.ok || !uploaded.url) throw new Error(uploaded.message ?? 'Upload failed');
      saveMutation.mutate(uploaded.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Signed Festival Calendar (PDF)</CardTitle>
        <CardDescription>
          Members see this on the public Festival Calendar page. Uploading a new file replaces it.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-wrap items-center gap-3'>
        {pdfUrl ? (
          <a
            href={pdfUrl}
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
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          isLoading={uploading || saveMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Icons.upload className='mr-2 h-4 w-4' />
          {pdfUrl ? 'Replace PDF' : 'Upload PDF'}
        </Button>
        {pdfUrl && (
          <Button
            variant='ghost'
            size='sm'
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate(null)}
          >
            Remove
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
