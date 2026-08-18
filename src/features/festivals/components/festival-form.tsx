'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFestivalMutation, updateFestivalMutation } from '../api/mutations';
import type { Festival } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { festivalSchema, type FestivalFormValues } from '../schemas/festival';

export default function FestivalForm({
  initialData,
  pageTitle
}: {
  initialData: Festival | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createFestivalMutation,
    onSuccess: () => {
      toast.success('Festival added');
      router.push('/dashboard/festivals');
    },
    onError: () => toast.error('Failed to add festival')
  });

  const updateMutation = useMutation({
    ...updateFestivalMutation,
    onSuccess: () => {
      toast.success('Festival updated');
      router.push('/dashboard/festivals');
    },
    onError: () => toast.error('Failed to update festival')
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      place: initialData?.place ?? '',
      dzongkhag: initialData?.dzongkhag ?? '',
      date_2025: initialData?.date_2025 ?? '',
      date_2026: initialData?.date_2026 ?? '',
      display_order: initialData?.display_order ?? 0
    } as FestivalFormValues,
    validators: { onSubmit: festivalSchema },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        place: value.place,
        dzongkhag: value.dzongkhag,
        date_2025: value.date_2025 || null,
        date_2026: value.date_2026 || null,
        display_order: value.display_order!
      };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField } = useFormFields<FestivalFormValues>();

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
                name='name'
                label='Festival Name'
                required
                placeholder='e.g. Paro Tshechu'
                validators={{ onBlur: z.string().min(2, 'Name must be at least 2 characters.') }}
              />
              <FormTextField
                name='place'
                label='Place'
                required
                placeholder='e.g. Rinpung Dzong, Paro'
                validators={{ onBlur: z.string().min(2, 'Place is required.') }}
              />
              <FormTextField
                name='dzongkhag'
                label='Dzongkhag'
                required
                placeholder='e.g. Paro'
                validators={{ onBlur: z.string().min(2, 'Dzongkhag is required.') }}
              />
              <FormTextField
                name='display_order'
                label='Display Order'
                required
                type='number'
                min={0}
                description='Lower numbers appear first.'
                validators={{ onBlur: z.number({ message: 'Display order is required' }) }}
              />
              <FormTextField
                name='date_2025'
                label='2025 Dates'
                placeholder='e.g. 09 – 13 Apr 2025'
              />
              <FormTextField
                name='date_2026'
                label='2026 Dates'
                placeholder='e.g. 29 Mar – 02 Apr 2026'
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Festival' : 'Add Festival'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
