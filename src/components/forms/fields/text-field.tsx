'use client';

import { useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface TextFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'onBlur'
> {
  label: string;
  description?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
}

export function TextField({
  label,
  description,
  required,
  type = 'text',
  className,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext();
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const isValid = useStore(field.store, (s) => s.meta.isValid);
  const isValidating = useStore(field.store, (s) => s.meta.isValidating);
  const value = useStore(field.store, (s) => s.value) as string | number;
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (passwordVisible ? 'text' : 'password') : type;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && ' *'}
        </FieldLabel>
        <div className='relative'>
          <Input
            id={field.name}
            type={inputType}
            value={value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => {
              if (type === 'number') {
                const v = e.target.value;
                field.handleChange(v === '' ? '' : parseFloat(v));
              } else {
                field.handleChange(e.target.value);
              }
            }}
            aria-invalid={isTouched && !isValid}
            className={cn(isPassword && 'pr-9', className)}
            {...inputProps}
          />
          {isPassword ? (
            <button
              type='button'
              tabIndex={-1}
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
            >
              {passwordVisible ? (
                <Icons.eyeOff className='h-4 w-4' />
              ) : (
                <Icons.eye className='h-4 w-4' />
              )}
            </button>
          ) : (
            isValidating && (
              <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                <Spinner className='h-4 w-4' />
              </div>
            )
          )}
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormTextField = createFormField(TextField);
