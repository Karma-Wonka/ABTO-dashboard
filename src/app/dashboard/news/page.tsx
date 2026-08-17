import PageContainer from '@/components/layout/page-container';
import NewsListingPage from '@/features/news/components/news-listing-page';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: News' };

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='News & Announcements'
      pageDescription='Tourism news posts shown on the homepage and /news.'
    >
      <NewsListingPage />
    </PageContainer>
  );
}
