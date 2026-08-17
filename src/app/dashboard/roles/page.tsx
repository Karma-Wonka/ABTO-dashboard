import PageContainer from '@/components/layout/page-container';
import RoleListingPage from '@/features/roles/components/role-listing-page';

export const metadata = { title: 'Dashboard: Roles' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Roles'
      pageDescription='Create custom roles and control exactly what each one can do.'
    >
      <RoleListingPage />
    </PageContainer>
  );
}
