'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

type SignUpFormValues = { name: string; email: string; password: string };

export function CredentialsSignUpForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useAppForm({
    defaultValues: { name: '', email: '', password: '' } as SignUpFormValues,
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitting(false);
        toast.error(data.message || 'Could not create your account.');
        return;
      }

      const result = await signIn('credentials', {
        email: value.email,
        password: value.password,
        redirect: false
      });
      setSubmitting(false);

      if (!result || result.error) {
        toast.error('Account created — please sign in.');
        router.push('/auth/sign-in');
        return;
      }
      router.push('/dashboard/overview');
    }
  });

  const { FormTextField } = useFormFields<SignUpFormValues>();

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to view the ABTO member directory. New accounts start as read-only members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-4'>
            <FormTextField name='name' label='Name' placeholder='Your name' />
            <FormTextField
              name='email'
              label='Email'
              type='email'
              required
              placeholder='you@company.bt'
              validators={{ onBlur: z.string().email('Enter a valid email address.') }}
            />
            <FormTextField
              name='password'
              label='Password'
              type='password'
              required
              placeholder='At least 8 characters'
              validators={{ onBlur: z.string().min(8, 'Password must be at least 8 characters.') }}
            />
            <form.SubmitButton className='w-full' disabled={submitting}>
              {submitting ? 'Creating account…' : 'Sign up'}
            </form.SubmitButton>
          </form.Form>
        </form.AppForm>
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/auth/sign-in' className='text-primary underline underline-offset-4'>
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
