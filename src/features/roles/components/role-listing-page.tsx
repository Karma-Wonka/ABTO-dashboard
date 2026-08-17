import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { rolesQueryOptions } from '../api/queries';
import { RoleTable, RoleTableSkeleton } from './role-table';

export default function RoleListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(rolesQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<RoleTableSkeleton />}>
        <RoleTable />
      </Suspense>
    </HydrationBoundary>
  );
}
