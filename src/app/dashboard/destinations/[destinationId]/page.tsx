import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { destinationByIdOptions } from '@/features/destinations/api/queries';
import PageContainer from '@/components/layout/page-container';
import DestinationViewPage from '@/features/destinations/components/destination-view-page';

export const metadata = { title: 'Dashboard: Destination' };

type PageProps = { params: Promise<{ destinationId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.destinationId !== 'new') {
    void queryClient.prefetchQuery(destinationByIdOptions(Number(params.destinationId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DestinationViewPage destinationId={params.destinationId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
