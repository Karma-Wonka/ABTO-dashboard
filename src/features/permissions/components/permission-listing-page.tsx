import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { permissionsQueryOptions } from '../api/queries';
import { PermissionTable, PermissionTableSkeleton } from './permission-table';

export default function PermissionListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(permissionsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PermissionTableSkeleton />}>
        <PermissionTable />
      </Suspense>
    </HydrationBoundary>
  );
}
