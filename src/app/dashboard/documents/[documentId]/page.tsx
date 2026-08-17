import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { documentByIdOptions } from '@/features/documents/api/queries';
import PageContainer from '@/components/layout/page-container';
import DocumentViewPage from '@/features/documents/components/document-view-page';

export const metadata = { title: 'Dashboard: Document' };

type PageProps = { params: Promise<{ documentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();
  if (params.documentId !== 'new') {
    void queryClient.prefetchQuery(documentByIdOptions(Number(params.documentId)));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DocumentViewPage documentId={params.documentId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
