import PageContainer from '@/components/layout/page-container';
import DocumentListingPage from '@/features/documents/components/document-listing-page';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = { title: 'Dashboard: Documents' };

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Downloads & Publications'
      pageDescription='Forms, templates, brand assets and annual reports available on the public site.'
    >
      <DocumentListingPage />
    </PageContainer>
  );
}
