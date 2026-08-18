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

interface DocumentImageFieldProps {
  label: string;
  description?: string;
}

// Cover image for a publication/download — stored as an R2 object key
// (private bucket), uploaded via POST /api/documents/image. Since the
// value isn't a renderable URL, this fetches a short-lived preview link
// whenever the key changes (on mount for an existing document, or right
// after a fresh upload).
export function DocumentImageField({ label, description }: DocumentImageFieldProps) {
  const field = useFieldContext();
  const key = useStore(field.store, (s) => s.value) as string;
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!key) {
      setPreviewUrl(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/documents/image?key=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPreviewUrl(data.viewUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/documents/image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.key) throw new Error(data.message ?? 'Upload failed');
      field.handleChange(data.key);
      setPreviewUrl(data.viewUrl ?? null);
      toast.success('Image uploaded');
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
        <div className='flex items-center gap-3'>
          <input
            ref={inputRef}
            type='file'
            accept='image/*'
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
            {key ? 'Replace Image' : 'Upload Image'}
          </Button>
          {key && (
            <Button type='button' variant='ghost' size='sm' onClick={() => field.handleChange('')}>
              Remove
            </Button>
          )}
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not a static/local asset
          <img src={previewUrl} alt='' className='mt-2 h-20 w-32 rounded-md border object-cover' />
        )}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormDocumentImageField = createFormField(DocumentImageField);
