'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createEventMutation, updateEventMutation } from '../api/mutations';
import type { Event } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  eventSchema,
  type EventFormValues,
  EVENT_TYPE_OPTIONS,
  EVENT_STATUS_OPTIONS
} from '../schemas/event';

export default function EventForm({
  initialData,
  pageTitle
}: {
  initialData: Event | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createEventMutation,
    onSuccess: () => {
      toast.success('Event created');
      router.push('/dashboard/events');
    },
    onError: () => toast.error('Failed to create event')
  });

  const updateMutation = useMutation({
    ...updateEventMutation,
    onSuccess: () => {
      toast.success('Event updated');
      router.push('/dashboard/events');
    },
    onError: () => toast.error('Failed to update event')
  });

  const form = useAppForm({
    defaultValues: {
      date: initialData?.date ?? '',
      title: initialData?.title ?? '',
      location: initialData?.location ?? '',
      type: initialData?.type ?? '',
      description: initialData?.description ?? '',
      capacity: initialData?.capacity,
      is_past: initialData ? String(initialData.is_past) : '0',
      detail_link: initialData?.detail_link ?? ''
    } as EventFormValues,
    validators: { onSubmit: eventSchema },
    onSubmit: ({ value }) => {
      const payload = {
        date: value.date,
        title: value.title,
        location: value.location,
        type: value.type,
        description: value.description,
        capacity: value.capacity!,
        is_past: (value.is_past === '1' ? 1 : 0) as 0 | 1,
        detail_link: value.detail_link || null
      };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } = useFormFields<EventFormValues>();

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
                label='Title'
                required
                placeholder='e.g. ABTO Annual General Meeting 2027'
                validators={{ onBlur: z.string().min(3, 'Title must be at least 3 characters.') }}
              />
              <FormTextField
                name='date'
                label='Date'
                required
                placeholder='YYYY-MM-DD'
                description='Format: YYYY-MM-DD'
                validators={{ onBlur: z.string().min(1, 'Date is required.') }}
              />
              <FormTextField
                name='location'
                label='Location'
                required
                placeholder='Thimphu'
                validators={{ onBlur: z.string().min(1, 'Location is required.') }}
              />
              <FormSelectField
                name='type'
                label='Type'
                required
                options={EVENT_TYPE_OPTIONS}
                placeholder='Select type'
                validators={{ onBlur: z.string().min(1, 'Please select a type.') }}
              />
              <FormTextField
                name='capacity'
                label='Capacity'
                required
                type='number'
                min={1}
                placeholder='e.g. 150'
                validators={{ onBlur: z.number({ message: 'Capacity is required' }) }}
              />
              <FormSelectField
                name='is_past'
                label='Status'
                required
                options={EVENT_STATUS_OPTIONS}
              />
              <FormTextField
                name='detail_link'
                label='Detail Page Link (optional)'
                placeholder='#/events/agm'
                description='Leave blank if this event has no dedicated detail page on the public site.'
              />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              required
              placeholder='What happens at this event'
              maxLength={500}
              rows={4}
              validators={{
                onBlur: z.string().min(10, 'Description must be at least 10 characters.')
              }}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Event' : 'Add Event'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
