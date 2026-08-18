import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { festivalByIdOptions } from '@/features/festivals/api/queries';
import PageContainer from '@/components/layout/page-container';
import FestivalViewPage from '@/features/festivals/components/festival-view-page';

export const metadata = { title: 'Dashboard: Festival' };

type PageProps = { params: Promise<{ festivalId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.festivalId !== 'new') {
    void queryClient.prefetchQuery(festivalByIdOptions(Number(params.festivalId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FestivalViewPage festivalId={params.festivalId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
