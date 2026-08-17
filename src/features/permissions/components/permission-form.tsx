'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createPermissionMutation, updatePermissionMutation } from '../api/mutations';
import { permissionSchema, type PermissionFormValues } from '../schemas/permission';
import type { Permission } from '../api/types';

export default function PermissionForm({
  initialData,
  pageTitle
}: {
  initialData: Permission | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const locked = !!initialData?.is_system;

  const createMutation = useMutation({
    ...createPermissionMutation,
    onSuccess: () => {
      toast.success('Permission created');
      router.push('/dashboard/permissions');
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to create permission')
  });

  const updateMutation = useMutation({
    ...updatePermissionMutation,
    onSuccess: () => {
      toast.success('Permission updated');
      router.push('/dashboard/permissions');
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update permission')
  });

  const form = useAppForm({
    defaultValues: {
      key: initialData?.key ?? '',
      resource: initialData?.resource ?? '',
      action: initialData?.action ?? '',
      description: initialData?.description ?? ''
    } as PermissionFormValues,
    validators: { onSubmit: permissionSchema },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: value });
      } else {
        createMutation.mutate(value);
      }
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<PermissionFormValues>();

  return (
    <Card className='mx-auto w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
        {locked && (
          <CardDescription>
            This is a system permission — its key, resource, and action are relied on by real route
            checks and can&apos;t be changed. You can still edit the description.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-6'>
            <FormTextField
              name='key'
              label='Key'
              required
              disabled={locked}
              placeholder='e.g. billing:read'
              description="Format: 'resource:action'."
              validators={{
                onBlur: z
                  .string()
                  .min(2)
                  .regex(/^[a-z0-9_]+:[a-z0-9_]+$/, "Must look like 'resource:action'.")
              }}
            />
            <FormTextField
              name='resource'
              label='Resource'
              required
              disabled={locked}
              placeholder='e.g. billing'
            />
            <FormTextField
              name='action'
              label='Action'
              required
              disabled={locked}
              placeholder='e.g. read'
            />
            <FormTextareaField
              name='description'
              label='Description'
              placeholder='What this permission allows'
              rows={3}
            />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Save' : 'Create Permission'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
