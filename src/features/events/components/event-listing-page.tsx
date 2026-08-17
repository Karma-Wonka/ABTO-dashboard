import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { eventsQueryOptions } from '../api/queries';
import { EventsTable, EventsTableSkeleton } from './event-table';

export default function EventListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('title');
  const pageLimit = searchParamsCache.get('perPage');
  const type = searchParamsCache.get('type');
  const isPast = searchParamsCache.get('is_past');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(type && { type }),
    ...(isPast && { is_past: isPast }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(eventsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EventsTableSkeleton />}>
        <EventsTable />
      </Suspense>
    </HydrationBoundary>
  );
}
