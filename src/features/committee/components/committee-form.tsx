'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCommitteeMutation, updateCommitteeMutation } from '../api/mutations';
import type { CommitteeMember } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { committeeSchema, type CommitteeFormValues, VACANT_OPTIONS } from '../schemas/committee';

export default function CommitteeForm({
  initialData,
  pageTitle
}: {
  initialData: CommitteeMember | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createCommitteeMutation,
    onSuccess: () => {
      toast.success('Committee seat created');
      router.push('/dashboard/committee');
    },
    onError: () => toast.error('Failed to create committee seat')
  });

  const updateMutation = useMutation({
    ...updateCommitteeMutation,
    onSuccess: () => {
      toast.success('Committee seat updated');
      router.push('/dashboard/committee');
    },
    onError: () => toast.error('Failed to update committee seat')
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      title: initialData?.title ?? '',
      seat_order: initialData?.seat_order ?? 0,
      photo_url: initialData?.photo_url ?? '',
      is_vacant: initialData ? String(initialData.is_vacant) : '0'
    } as CommitteeFormValues,
    validators: { onSubmit: committeeSchema },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        title: value.title,
        seat_order: value.seat_order!,
        photo_url: value.photo_url || null,
        is_vacant: (value.is_vacant === '1' ? 1 : 0) as 0 | 1
      };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormImageUrlField } =
    useFormFields<CommitteeFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormTextField
                name='title'
                label='Seat Title'
                required
                placeholder='e.g. Chairman, Treasurer'
                validators={{ onBlur: z.string().min(2, 'Title must be at least 2 characters.') }}
              />
              <FormSelectField name='is_vacant' label='Status' required options={VACANT_OPTIONS} />
              <FormTextField
                name='name'
                label='Name'
                placeholder='Leave blank if this seat is vacant'
              />
              <FormTextField
                name='seat_order'
                label='Display Order'
                required
                type='number'
                min={0}
                description='Lower numbers appear first.'
                validators={{ onBlur: z.number({ message: 'Seat order is required' }) }}
              />
              <FormImageUrlField
                name='photo_url'
                label='Photo'
                description='Leave blank to show initials instead.'
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Seat' : 'Add Seat'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
