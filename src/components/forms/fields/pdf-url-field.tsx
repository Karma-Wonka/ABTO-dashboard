'use client';

import { useRef, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
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

interface PdfUrlFieldProps {
  label: string;
  description?: string;
  required?: boolean;
}

// A URL text field with an inline upload button, for PDFs — same pattern as
// ImageUrlField (see that file), just gated on application/pdf instead of
// image/* and without an image preview.
export function PdfUrlField({ label, description, required }: PdfUrlFieldProps) {
  const field = useFieldContext();
  const value = useStore(field.store, (s) => s.value) as string;
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message ?? 'Upload failed');
      field.handleChange(data.url);
      toast.success('PDF uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && ' *'}
        </FieldLabel>
        <div className='flex gap-2'>
          <Input
            id={field.name}
            type='url'
            placeholder='https://…'
            value={value ?? ''}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
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
            size='icon'
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Icons.spinner className='h-4 w-4 animate-spin' />
            ) : (
              <Icons.upload className='h-4 w-4' />
            )}
          </Button>
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
        {value && (
          <a
            href={value}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary mt-2 inline-block text-sm underline underline-offset-2'
          >
            View current PDF
          </a>
        )}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormPdfUrlField = createFormField(PdfUrlField);
