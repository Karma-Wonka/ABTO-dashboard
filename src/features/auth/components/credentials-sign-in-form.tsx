'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

type SignInFormValues = { email: string; password: string };

export function CredentialsSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useAppForm({
    defaultValues: { email: '', password: '' } as SignInFormValues,
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      const result = await signIn('credentials', {
        email: value.email,
        password: value.password,
        redirect: false
      });
      setSubmitting(false);

      if (!result || result.error) {
        toast.error('Incorrect email or password.');
        return;
      }
      router.push(searchParams.get('callbackUrl') || '/dashboard/overview');
    }
  });

  const { FormTextField } = useFormFields<SignInFormValues>();

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back — sign in to the ABTO dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-4'>
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
              placeholder='••••••••'
              validators={{ onBlur: z.string().min(1, 'Enter your password.') }}
            />
            <form.SubmitButton className='w-full' disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </form.SubmitButton>
          </form.Form>
        </form.AppForm>
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link href='/auth/sign-up' className='text-primary underline underline-offset-4'>
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
