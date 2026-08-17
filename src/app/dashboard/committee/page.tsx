import PageContainer from '@/components/layout/page-container';
import CommitteeListingPage from '@/features/committee/components/committee-listing-page';

export const metadata = { title: 'Dashboard: Committee' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Executive Committee'
      pageDescription='Seats shown on /about#committee on the public site.'
    >
      <CommitteeListingPage />
    </PageContainer>
  );
}
