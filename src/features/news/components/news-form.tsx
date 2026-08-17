'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createNewsMutation, updateNewsMutation } from '../api/mutations';
import type { NewsPost } from '../api/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { newsSchema, type NewsFormValues, NEWS_CATEGORY_OPTIONS } from '../schemas/news';

export default function NewsForm({
  initialData,
  pageTitle
}: {
  initialData: NewsPost | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createNewsMutation,
    onSuccess: () => {
      toast.success('News post created');
      router.push('/dashboard/news');
    },
    onError: () => toast.error('Failed to create news post')
  });

  const updateMutation = useMutation({
    ...updateNewsMutation,
    onSuccess: () => {
      toast.success('News post updated');
      router.push('/dashboard/news');
    },
    onError: () => toast.error('Failed to update news post')
  });

  const form = useAppForm({
    defaultValues: {
      date: initialData?.date ?? '',
      category: initialData?.category ?? '',
      title: initialData?.title ?? '',
      body: initialData?.body ?? '',
      image_url: initialData?.image_url ?? ''
    } as NewsFormValues,
    validators: { onSubmit: newsSchema },
    onSubmit: ({ value }) => {
      const payload = { ...value, image_url: value.image_url || null };
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField, FormImageUrlField } =
    useFormFields<NewsFormValues>();

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
                placeholder='Headline'
                validators={{ onBlur: z.string().min(5, 'Title must be at least 5 characters.') }}
              />
              <FormTextField
                name='date'
                label='Date'
                required
                placeholder='YYYY-MM-DD'
                description='Format: YYYY-MM-DD'
                validators={{ onBlur: z.string().min(1, 'Date is required.') }}
              />
              <FormSelectField
                name='category'
                label='Category'
                required
                options={NEWS_CATEGORY_OPTIONS}
                placeholder='Select category'
                validators={{ onBlur: z.string().min(1, 'Please select a category.') }}
              />
            </div>

            <FormImageUrlField
              name='image_url'
              label='Hero Image'
              description='Leave blank to use a placeholder image on the public site.'
            />

            <FormTextareaField
              name='body'
              label='Body'
              required
              placeholder='The story'
              maxLength={1000}
              rows={6}
              validators={{ onBlur: z.string().min(10, 'Body must be at least 10 characters.') }}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Post' : 'Publish Post'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
