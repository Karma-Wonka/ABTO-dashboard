import PageContainer from '@/components/layout/page-container';
import EventListingPage from '@/features/events/components/event-listing-page';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: Events' };

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Events'
      pageDescription="ABTO's event calendar — forums, workshops, the AGM, BITM and RBF."
    >
      <EventListingPage />
    </PageContainer>
  );
}
