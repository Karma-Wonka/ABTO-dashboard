import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { accountsQueryOptions } from '../api/queries';
import { rolesQueryOptions } from '@/features/roles/api/queries';
import { AccountTable, AccountTableSkeleton } from './account-table';

export default function AccountListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(accountsQueryOptions());
  void queryClient.prefetchQuery(rolesQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AccountTableSkeleton />}>
        <AccountTable />
      </Suspense>
    </HydrationBoundary>
  );
}
