import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { committeeByIdOptions } from '@/features/committee/api/queries';
import PageContainer from '@/components/layout/page-container';
import CommitteeViewPage from '@/features/committee/components/committee-view-page';

export const metadata = { title: 'Dashboard: Committee Seat' };

type PageProps = { params: Promise<{ committeeId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.committeeId !== 'new') {
    void queryClient.prefetchQuery(committeeByIdOptions(Number(params.committeeId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CommitteeViewPage committeeId={params.committeeId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
