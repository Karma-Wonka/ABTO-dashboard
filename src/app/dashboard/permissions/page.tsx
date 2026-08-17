import PageContainer from '@/components/layout/page-container';
import PermissionListingPage from '@/features/permissions/components/permission-listing-page';

export const metadata = { title: 'Dashboard: Permissions' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Permissions'
      pageDescription='The permission keys roles are built from. System permissions back real route checks and cannot be deleted.'
    >
      <PermissionListingPage />
    </PageContainer>
  );
}
