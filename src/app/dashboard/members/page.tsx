import PageContainer from '@/components/layout/page-container';
import MemberListingPage from '@/features/members/components/member-listing-page';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Members'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Member Directory'
      pageDescription='The licensed tour operators ABTO represents. Members can edit their own listing; the secretariat manages the full directory.'
    >
      <MemberListingPage />
    </PageContainer>
  );
}
