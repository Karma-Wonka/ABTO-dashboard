'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDocumentMutation, updateDocumentMutation } from '../api/mutations';
import type { Document } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  documentSchema,
  type DocumentFormValues,
  KIND_OPTIONS,
  DOC_TYPE_OPTIONS
} from '../schemas/document';

export default function DocumentForm({
  initialData,
  pageTitle
}: {
  initialData: Document | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createDocumentMutation,
    onSuccess: () => {
      toast.success('Document created');
      router.push('/dashboard/documents');
    },
    onError: () => toast.error('Failed to create document')
  });

  const updateMutation = useMutation({
    ...updateDocumentMutation,
    onSuccess: () => {
      toast.success('Document updated');
      router.push('/dashboard/documents');
    },
    onError: () => toast.error('Failed to update document')
  });

  const form = useAppForm({
    defaultValues: {
      kind: initialData?.kind ?? 'download',
      title: initialData?.title ?? '',
      category: initialData?.category ?? '',
      doc_type: initialData?.doc_type ?? '',
      size: initialData?.size ?? '',
      year: initialData?.year ?? '',
      description: initialData?.description ?? ''
    } as DocumentFormValues,
    validators: { onSubmit: documentSchema },
    onSubmit: ({ value }) => {
      const payload = {
        kind: value.kind as 'download' | 'publication',
        title: value.title,
        category: value.category || null,
        doc_type: value.doc_type,
        size: value.size || null,
        year: value.year || null,
        description: value.description || null
      };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } = useFormFields<DocumentFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormSelectField
                name='kind'
                label='Kind'
                required
                options={KIND_OPTIONS}
                placeholder='Select kind'
                validators={{ onBlur: z.string().min(1, 'Please select a kind.') }}
              />
              <FormTextField
                name='title'
                label='Title'
                required
                placeholder='e.g. ABTO Membership Registration Form'
                validators={{ onBlur: z.string().min(3, 'Title must be at least 3 characters.') }}
              />
              <FormSelectField
                name='doc_type'
                label='File / Publication Type'
                required
                options={DOC_TYPE_OPTIONS}
                placeholder='Select type'
                validators={{ onBlur: z.string().min(1, 'Please select a document type.') }}
              />
              <FormTextField
                name='category'
                label='Category'
                placeholder='e.g. Membership, Governance, Templates, Media'
                description='Downloads only.'
              />
              <FormTextField
                name='size'
                label='File Size'
                placeholder='e.g. 186 KB'
                description='Downloads only.'
              />
              <FormTextField
                name='year'
                label='Year'
                placeholder='e.g. 2024'
                description='Publications only.'
              />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              placeholder='One line describing the publication (publications only)'
              maxLength={500}
              rows={3}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Document' : 'Add Document'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
