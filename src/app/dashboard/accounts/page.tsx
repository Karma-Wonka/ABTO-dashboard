import PageContainer from '@/components/layout/page-container';
import AccountListingPage from '@/features/accounts/components/account-listing-page';

export const metadata = { title: 'Dashboard: Accounts' };

export default function Page() {
  return (
    <PageContainer
      pageTitle='Accounts'
      pageDescription='Everyone who has signed in — assign roles, reset a password, or remove access.'
    >
      <AccountListingPage />
    </PageContainer>
  );
}
