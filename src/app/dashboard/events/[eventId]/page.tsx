import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { eventByIdOptions } from '@/features/events/api/queries';
import PageContainer from '@/components/layout/page-container';
import EventViewPage from '@/features/events/components/event-view-page';

export const metadata = { title: 'Dashboard: Event' };

type PageProps = { params: Promise<{ eventId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.eventId !== 'new') {
    void queryClient.prefetchQuery(eventByIdOptions(Number(params.eventId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EventViewPage eventId={params.eventId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
