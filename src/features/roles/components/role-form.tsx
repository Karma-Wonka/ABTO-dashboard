'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  createRoleMutation,
  updateRoleMutation,
  setRolePermissionsMutation
} from '../api/mutations';
import { roleSchema, type RoleFormValues } from '../schemas/role';
import type { Role } from '../api/types';
import { permissionsQueryOptions } from '@/features/permissions/api/queries';

export default function RoleForm({
  initialData,
  pageTitle
}: {
  initialData: Role | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createRoleMutation,
    onSuccess: (data) => {
      toast.success('Role created');
      router.push(`/dashboard/roles/${data.role.id}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create role')
  });

  const updateMutation = useMutation({
    ...updateRoleMutation,
    onSuccess: () => toast.success('Role updated'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update role')
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? ''
    } as RoleFormValues,
    validators: { onSubmit: roleSchema },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: value });
      } else {
        createMutation.mutate(value);
      }
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<RoleFormValues>();

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
          {initialData?.is_system && (
            <CardDescription>
              This is a system role — it can&apos;t be renamed or deleted, but you can still change
              what it&apos;s allowed to do below.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form className='space-y-6'>
              <FormTextField
                name='name'
                label='Name'
                required
                disabled={initialData?.is_system}
                placeholder='e.g. Editor'
                validators={{ onBlur: z.string().min(2, 'Name must be at least 2 characters.') }}
              />
              <FormTextareaField
                name='description'
                label='Description'
                placeholder='What this role is for'
                rows={3}
              />
              <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => router.back()}>
                  Back
                </Button>
                <form.SubmitButton>{isEdit ? 'Save' : 'Create Role'}</form.SubmitButton>
              </div>
            </form.Form>
          </form.AppForm>
        </CardContent>
      </Card>

      {isEdit && <RolePermissionsEditor role={initialData} />}
    </div>
  );
}

function RolePermissionsEditor({ role }: { role: Role }) {
  const { data } = useSuspenseQuery(permissionsQueryOptions());
  const allPermissions = data.permissions;
  const [selected, setSelected] = useState<Set<string>>(new Set(role.permissions));

  const mutation = useMutation({
    ...setRolePermissionsMutation,
    onSuccess: () => toast.success('Permissions updated'),
    onError: () => toast.error('Failed to update permissions')
  });

  const grouped = allPermissions.reduce<Record<string, typeof allPermissions>>((acc, p) => {
    (acc[p.resource] ??= []).push(p);
    return acc;
  }, {});

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription>
          What accounts with the {role.name} role are allowed to do.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {Object.entries(grouped).map(([resource, perms]) => (
          <div key={resource}>
            <h4 className='mb-2 text-sm font-medium capitalize'>{resource}</h4>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {perms.map((p) => (
                <div key={p.key} className='flex items-start gap-2'>
                  <Checkbox
                    id={`perm-${p.key}`}
                    checked={selected.has(p.key)}
                    onCheckedChange={() => toggle(p.key)}
                  />
                  <Label htmlFor={`perm-${p.key}`} className='flex flex-col gap-0.5 font-normal'>
                    <span>
                      {p.action}
                      {p.is_system && (
                        <Badge variant='outline' className='ml-2 text-xs'>
                          system
                        </Badge>
                      )}
                    </span>
                    {p.description && (
                      <span className='text-muted-foreground text-xs'>{p.description}</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className='flex justify-end'>
          <Button
            onClick={() =>
              mutation.mutate({ id: role.id, values: { permissions: Array.from(selected) } })
            }
            disabled={mutation.isPending}
          >
            Save permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
