import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { submissionsQueryOptions } from '../api/queries';
import { SubmissionTable } from './submission-listing';

export default function SubmissionListingPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(submissionsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubmissionTable />
    </HydrationBoundary>
  );
}
