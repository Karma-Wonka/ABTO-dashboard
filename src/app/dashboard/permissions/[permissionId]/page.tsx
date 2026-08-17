import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { permissionByIdOptions } from '@/features/permissions/api/queries';
import PageContainer from '@/components/layout/page-container';
import PermissionViewPage from '@/features/permissions/components/permission-view-page';

export const metadata = { title: 'Dashboard: Permission' };

type PageProps = { params: Promise<{ permissionId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();

  if (params.permissionId !== 'new') {
    void queryClient.prefetchQuery(permissionByIdOptions(Number(params.permissionId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PermissionViewPage permissionId={params.permissionId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
