import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { roleByIdOptions } from '@/features/roles/api/queries';
import { permissionsQueryOptions } from '@/features/permissions/api/queries';
import PageContainer from '@/components/layout/page-container';
import RoleViewPage from '@/features/roles/components/role-view-page';

export const metadata = { title: 'Dashboard: Role' };

type PageProps = { params: Promise<{ roleId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();

  if (params.roleId !== 'new') {
    void queryClient.prefetchQuery(roleByIdOptions(Number(params.roleId)));
    void queryClient.prefetchQuery(permissionsQueryOptions());
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <RoleViewPage roleId={params.roleId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
