import PageContainer from '@/components/layout/page-container';
import SubmissionListingPage from '@/features/submissions/components/submission-listing-page';

export const metadata = { title: 'Dashboard: Submissions' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Submissions'
      pageDescription='Contact and membership application form submissions from the public site.'
    >
      <SubmissionListingPage />
    </PageContainer>
  );
}
