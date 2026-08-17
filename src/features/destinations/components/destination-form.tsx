'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDestinationMutation, updateDestinationMutation } from '../api/mutations';
import type { Destination } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  destinationSchema,
  type DestinationFormValues,
  DESTINATION_KIND_OPTIONS
} from '../schemas/destination';

export default function DestinationForm({
  initialData,
  pageTitle
}: {
  initialData: Destination | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createDestinationMutation,
    onSuccess: () => {
      toast.success('Destination created');
      router.push('/dashboard/destinations');
    },
    onError: () => toast.error('Failed to create destination')
  });

  const updateMutation = useMutation({
    ...updateDestinationMutation,
    onSuccess: () => {
      toast.success('Destination updated');
      router.push('/dashboard/destinations');
    },
    onError: () => toast.error('Failed to update destination')
  });

  const form = useAppForm({
    defaultValues: {
      kind: initialData?.kind ?? 'place',
      name: initialData?.name ?? '',
      tagline: initialData?.tagline ?? '',
      description: initialData?.description ?? '',
      image_url: initialData?.image_url ?? '',
      seat_order: initialData?.seat_order ?? 0
    } as DestinationFormValues,
    validators: { onSubmit: destinationSchema },
    onSubmit: ({ value }) => {
      const payload = {
        kind: value.kind as 'place' | 'druk_air' | 'tashi_air',
        name: value.name,
        tagline: value.tagline || null,
        description: value.description,
        image_url: value.image_url || null,
        seat_order: value.seat_order!
      };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField, FormImageUrlField } =
    useFormFields<DestinationFormValues>();

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
                options={DESTINATION_KIND_OPTIONS}
                validators={{ onBlur: z.string().min(1, 'Please select a kind.') }}
              />
              <FormTextField
                name='name'
                label='Name'
                required
                placeholder='e.g. Paro'
                validators={{ onBlur: z.string().min(1, 'Name is required.') }}
              />
              <FormTextField
                name='tagline'
                label='Tagline / Country'
                placeholder='e.g. Gateway to the Kingdom, or Nepal'
                description='For Places this is a tagline; for airport gateways this is the country.'
              />
              <FormTextField
                name='seat_order'
                label='Display Order'
                required
                type='number'
                min={0}
                description='Lower numbers appear first, within the same kind.'
                validators={{ onBlur: z.number({ message: 'Display order is required' }) }}
              />
              <FormImageUrlField name='image_url' label='Image' />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              required
              rows={4}
              validators={{
                onBlur: z.string().min(10, 'Description must be at least 10 characters.')
              }}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>
                {isEdit ? 'Update Destination' : 'Add Destination'}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
