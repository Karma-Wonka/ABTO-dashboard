import PageContainer from '@/components/layout/page-container';
import FestivalListingPage from '@/features/festivals/components/festival-listing-page';

export const metadata = { title: 'Dashboard: Festival Calendar' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Festival Calendar Manager'
      pageDescription='Tshechu dates shown on /festivals (members-only) on the public site, plus the signed calendar PDF.'
    >
      <FestivalListingPage />
    </PageContainer>
  );
}
