'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/tanstack-form';
import { resetPasswordMutation } from '../api/mutations';
import type { Account } from '../api/types';

export function ResetPasswordDialog({
  account,
  open,
  onOpenChange
}: {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const resetMutation = useMutation({
    ...resetPasswordMutation,
    onSuccess: () => {
      toast.success(`Password reset for ${account?.email}`);
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to reset password')
  });

  const form = useAppForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
    onSubmit: ({ value }) => {
      if (!account) return;
      resetMutation.mutate({ email: account.email, newPassword: value.newPassword });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for <strong>{account?.email}</strong>. They will need to sign in with
            this new password.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='reset-password-form' className='space-y-4'>
            <form.AppField
              name='newPassword'
              validators={{ onBlur: z.string().min(8, 'At least 8 characters.') }}
            >
              {(field) => (
                <field.TextField
                  label='New Password'
                  required
                  type='password'
                  placeholder='At least 8 characters'
                />
              )}
            </form.AppField>

            <form.AppField
              name='confirmPassword'
              validators={{
                onChangeListenTo: ['newPassword'],
                onBlur: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue('newPassword');
                  if (!value) return 'Required.';
                  return value !== password ? 'Passwords do not match.' : undefined;
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='Confirm Password'
                  required
                  type='password'
                  placeholder='Re-enter the new password'
                />
              )}
            </form.AppField>
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='reset-password-form' disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'Saving…' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
