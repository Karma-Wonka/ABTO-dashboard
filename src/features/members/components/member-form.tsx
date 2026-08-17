'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createMemberMutation, updateMemberMutation } from '../api/mutations';
import type { Member } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  memberSchema,
  type MemberFormValues,
  REGION_OPTIONS,
  STATUS_OPTIONS
} from '@/features/members/schemas/member';

export default function MemberForm({
  initialData,
  pageTitle,
  /** Self-service edit by the operator themselves — email/status stay fixed. */
  restricted = false
}: {
  initialData: Member | null;
  pageTitle: string;
  restricted?: boolean;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createMemberMutation,
    onSuccess: () => {
      toast.success('Member created');
      router.push('/dashboard/members');
    },
    onError: () => toast.error('Failed to create member')
  });

  const updateMutation = useMutation({
    ...updateMemberMutation,
    onSuccess: () => {
      toast.success('Member updated');
      router.push('/dashboard/members');
    },
    onError: () =>
      toast.error('Failed to update member — check you have permission to edit this listing')
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      region: initialData?.region ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      website: initialData?.website ?? '',
      description: initialData?.description ?? '',
      specialties: initialData?.specialties.join(', ') ?? '',
      languages: initialData?.languages.join(', ') ?? 'English',
      member_since: initialData?.member_since,
      status: initialData?.status ?? 'active'
    } as MemberFormValues,
    validators: {
      onSubmit: memberSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        region: value.region,
        phone: value.phone,
        email: value.email,
        website: value.website,
        description: value.description,
        specialties: value.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        languages: value.languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        member_since: value.member_since!,
        status: value.status as 'active' | 'pending'
      };

      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } = useFormFields<MemberFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
        {restricted && (
          <p className='text-muted-foreground text-sm'>
            You're editing your own listing. Email and membership status can only be changed by the
            secretariat.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormTextField
                name='name'
                label='Company Name'
                required
                placeholder='e.g. Bhutan Green Travel'
                disabled={restricted}
                validators={{
                  onBlur: z.string().min(2, 'Company name must be at least 2 characters.')
                }}
              />

              <FormSelectField
                name='region'
                label='Region'
                required
                options={REGION_OPTIONS}
                placeholder='Select region'
                validators={{ onBlur: z.string().min(1, 'Please select a region.') }}
              />

              <FormTextField name='phone' label='Phone' placeholder='+975 17xxxxxx' />

              <FormTextField
                name='email'
                label='Email'
                required
                type='email'
                placeholder='name@company.bt'
                disabled={restricted}
                validators={{ onBlur: z.string().email('Enter a valid email address.') }}
              />

              <FormTextField name='website' label='Website' placeholder='www.company.bt' />

              <FormTextField
                name='member_since'
                label='Member Since'
                required
                type='number'
                min={2000}
                max={new Date().getFullYear()}
                placeholder='e.g. 2016'
                disabled={restricted}
                validators={{ onBlur: z.number({ message: 'Member-since year is required' }) }}
              />

              <FormTextField
                name='specialties'
                label='Specialties'
                required
                placeholder='Trekking, Cultural Tours, Birding'
                description='Comma-separated.'
                validators={{ onBlur: z.string().min(1, 'List at least one specialty.') }}
              />

              <FormTextField
                name='languages'
                label='Languages'
                required
                placeholder='English, Japanese'
                description='Comma-separated.'
                validators={{ onBlur: z.string().min(1, 'List at least one language.') }}
              />

              {!restricted && (
                <FormSelectField
                  name='status'
                  label='Status'
                  required
                  options={STATUS_OPTIONS}
                  placeholder='Select status'
                  validators={{ onBlur: z.string().min(1, 'Please select a status.') }}
                />
              )}
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              required
              placeholder='What this operator offers guests'
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
              <form.SubmitButton>{isEdit ? 'Update Listing' : 'Add Member'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
