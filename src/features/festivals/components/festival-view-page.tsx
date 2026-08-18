'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { Festival } from '../api/types';
import FestivalForm from './festival-form';
import { festivalByIdOptions } from '../api/queries';

export default function FestivalViewPage({ festivalId }: { festivalId: string }) {
  if (festivalId === 'new') {
    return <FestivalForm initialData={null} pageTitle='New Festival' />;
  }
  return <EditFestivalView festivalId={Number(festivalId)} />;
}

function EditFestivalView({ festivalId }: { festivalId: number }) {
  const { data } = useSuspenseQuery(festivalByIdOptions(festivalId));
  if (!data?.success || !data?.festival) notFound();
  return <FestivalForm initialData={data.festival as Festival} pageTitle='Edit Festival' />;
}
