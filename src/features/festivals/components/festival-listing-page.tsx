import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { festivalsQueryOptions, festivalCalendarPdfOptions } from '../api/queries';
import { FestivalCalendarPdfCard } from './festival-calendar-pdf-card';
import { FestivalTable } from './festival-listing';

export default function FestivalListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(festivalsQueryOptions());
  void queryClient.prefetchQuery(festivalCalendarPdfOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='space-y-6'>
        <FestivalCalendarPdfCard />
        <FestivalTable />
      </div>
    </HydrationBoundary>
  );
}
