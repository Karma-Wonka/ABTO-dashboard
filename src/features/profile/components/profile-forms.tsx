'use client';

import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateNameMutation, updatePasswordMutation } from '../api/mutations';
import type { NameFormValues, PasswordFormValues } from '../schemas/profile';

function EditNameCard({ initialName }: { initialName: string }) {
  const { update } = useSession();

  const mutation = useMutation({
    ...updateNameMutation,
    onSuccess: async () => {
      toast.success('Name updated');
      await update({ name: form.getFieldValue('name') });
    },
    onError: () => toast.error('Failed to update name')
  });

  const form = useAppForm({
    defaultValues: { name: initialName } as NameFormValues,
    onSubmit: ({ value }) => mutation.mutate(value.name)
  });

  const { FormTextField } = useFormFields<NameFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name</CardTitle>
        <CardDescription>Shown across the dashboard wherever your account appears.</CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-4'>
            <FormTextField
              name='name'
              label='Name'
              required
              validators={{ onBlur: z.string().min(2, 'Name must be at least 2 characters.') }}
            />
            <form.SubmitButton disabled={mutation.isPending}>Save</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const mutation = useMutation({
    ...updatePasswordMutation,
    onSuccess: () => {
      toast.success('Password updated');
      form.reset();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update password')
  });

  const form = useAppForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    } as PasswordFormValues,
    onSubmit: ({ value }) => mutation.mutate({ newPassword: value.newPassword })
  });

  const { FormTextField } = useFormFields<PasswordFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change the password used to sign in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-4'>
            <FormTextField
              name='newPassword'
              label='New password'
              type='password'
              required
              validators={{
                onBlur: z.string().min(8, 'New password must be at least 8 characters.')
              }}
            />
            <form.AppField
              name='confirmPassword'
              validators={{
                onChangeListenTo: ['newPassword'],
                onChange: ({ value, fieldApi }) => {
                  const newPassword = fieldApi.form.getFieldValue('newPassword');
                  return value !== newPassword ? 'Passwords do not match' : undefined;
                },
                onBlur: z.string().min(1, 'Confirm your new password.')
              }}
            >
              {(field) => <field.TextField label='Confirm new password' required type='password' />}
            </form.AppField>
            <form.SubmitButton disabled={mutation.isPending}>Update password</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}

export function ProfileForms({ initialName }: { initialName: string }) {
  return (
    <>
      <EditNameCard initialName={initialName} />
      <ChangePasswordCard />
    </>
  );
}
