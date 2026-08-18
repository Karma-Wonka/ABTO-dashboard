'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';
import { Icons } from '@/components/icons';

interface DocumentFileFieldProps {
  label: string;
  description?: string;
}

// The actual downloadable file for a Download/Publication — stored as an
// R2 object key (private bucket), uploaded via POST /api/documents/file.
// Same pattern as DocumentImageField, but no image preview — just a
// signed "View current file" link, fetched whenever the key changes.
export function DocumentFileField({ label, description }: DocumentFileFieldProps) {
  const field = useFieldContext();
  const key = useStore(field.store, (s) => s.value) as string;
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!key) {
      setViewUrl(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/documents/file?key=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setViewUrl(data.viewUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setViewUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/documents/file', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.key) throw new Error(data.message ?? 'Upload failed');
      field.handleChange(data.key);
      setViewUrl(data.viewUrl ?? null);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <div className='flex flex-wrap items-center gap-3'>
          <input
            ref={inputRef}
            type='file'
            accept='.pdf,.doc,.docx,.zip'
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
            isLoading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Icons.upload className='mr-2 h-4 w-4' />
            {key ? 'Replace File' : 'Upload File'}
          </Button>
          {key && (
            <Button type='button' variant='ghost' size='sm' onClick={() => field.handleChange('')}>
              Remove
            </Button>
          )}
          {viewUrl && (
            <a
              href={viewUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary text-sm underline underline-offset-2'
            >
              View current file
            </a>
          )}
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormDocumentFileField = createFormField(DocumentFileField);
