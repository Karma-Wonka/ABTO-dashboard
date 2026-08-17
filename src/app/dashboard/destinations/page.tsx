import PageContainer from '@/components/layout/page-container';
import DestinationListingPage from '@/features/destinations/components/destination-listing-page';

export const metadata = { title: 'Dashboard: Destinations' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Travel Destinations'
      pageDescription='Places and airline gateways shown on the public /travel page.'
    >
      <DestinationListingPage />
    </PageContainer>
  );
}
