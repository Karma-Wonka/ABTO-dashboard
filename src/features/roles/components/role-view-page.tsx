'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { roleByIdOptions } from '../api/queries';
import RoleForm from './role-form';

export default function RoleViewPage({ roleId }: { roleId: string }) {
  if (roleId === 'new') {
    return <RoleForm initialData={null} pageTitle='Add Role' />;
  }
  return <EditRole roleId={Number(roleId)} />;
}

function EditRole({ roleId }: { roleId: number }) {
  const { data } = useSuspenseQuery(roleByIdOptions(roleId));
  if (!data?.success || !data?.role) notFound();
  return <RoleForm initialData={data.role} pageTitle='Edit Role' />;
}
