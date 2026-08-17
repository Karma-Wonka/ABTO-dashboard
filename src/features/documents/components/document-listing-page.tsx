import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { documentsQueryOptions } from '../api/queries';
import { DocumentsTable, DocumentsTableSkeleton } from './document-table';

export default function DocumentListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('title');
  const pageLimit = searchParamsCache.get('perPage');
  const kind = searchParamsCache.get('kind');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(kind && { kind }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(documentsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DocumentsTableSkeleton />}>
        <DocumentsTable />
      </Suspense>
    </HydrationBoundary>
  );
}
