import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { committeeQueryOptions } from '../api/queries';
import { CommitteeTable } from './committee-listing';

export default function CommitteeListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(committeeQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommitteeTable />
    </HydrationBoundary>
  );
}
