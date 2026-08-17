import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { overviewStatsQueryOptions } from '@/features/overview/api/queries';
import {
  OverviewCards,
  OverviewCardsSkeleton
} from '@/features/overview/components/overview-cards';
import React from 'react';

export default function OverViewLayout({
  pie_stats,
  bar_stats,
  area_stats
}: {
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(overviewStatsQueryOptions());

  return (
    <PageContainer>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='flex flex-1 flex-col space-y-2'>
          <Suspense fallback={<OverviewCardsSkeleton />}>
            <OverviewCards />
          </Suspense>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <div className='col-span-4 lg:col-span-7'>{bar_stats}</div>
            <div className='col-span-4'>{area_stats}</div>
            <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
          </div>
        </div>
      </HydrationBoundary>
    </PageContainer>
  );
}
