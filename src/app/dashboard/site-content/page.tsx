import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { siteContentQueryOptions } from '@/features/site-content/api/queries';
import PageContainer from '@/components/layout/page-container';
import SiteContentViewPage from '@/features/site-content/components/site-content-view-page';

export const metadata = { title: 'Dashboard: Site Content' };

export default async function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(siteContentQueryOptions());

  return (
    <PageContainer
      pageTitle='Site Content'
      pageDescription='Edit copy shown on the public abto.org.bt site — home, about, membership, contact, navigation, footer, and SEO.'
    >
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SiteContentViewPage />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
