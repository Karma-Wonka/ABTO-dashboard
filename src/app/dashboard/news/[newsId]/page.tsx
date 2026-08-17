import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { newsByIdOptions } from '@/features/news/api/queries';
import PageContainer from '@/components/layout/page-container';
import NewsViewPage from '@/features/news/components/news-view-page';

export const metadata = { title: 'Dashboard: News Post' };

type PageProps = { params: Promise<{ newsId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.newsId !== 'new') {
    void queryClient.prefetchQuery(newsByIdOptions(Number(params.newsId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <NewsViewPage newsId={params.newsId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
