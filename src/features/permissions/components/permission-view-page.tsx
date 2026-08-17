'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { permissionByIdOptions } from '../api/queries';
import PermissionForm from './permission-form';

export default function PermissionViewPage({ permissionId }: { permissionId: string }) {
  if (permissionId === 'new') {
    return <PermissionForm initialData={null} pageTitle='Add Permission' />;
  }
  return <EditPermission permissionId={Number(permissionId)} />;
}

function EditPermission({ permissionId }: { permissionId: number }) {
  const { data } = useSuspenseQuery(permissionByIdOptions(permissionId));
  if (!data?.success || !data?.permission) notFound();
  return <PermissionForm initialData={data.permission} pageTitle='Edit Permission' />;
}
