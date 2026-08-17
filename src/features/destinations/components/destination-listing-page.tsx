import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { destinationsQueryOptions } from '../api/queries';
import { DestinationTable } from './destination-listing';

export default function DestinationListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(destinationsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DestinationTable />
    </HydrationBoundary>
  );
}
