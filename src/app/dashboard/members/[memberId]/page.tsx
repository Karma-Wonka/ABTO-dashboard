import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { memberByIdOptions, myMemberOptions } from '@/features/members/api/queries';
import PageContainer from '@/components/layout/page-container';
import MemberViewPage from '@/features/members/components/member-view-page';

export const metadata = {
  title: 'Dashboard: Member'
};

type PageProps = { params: Promise<{ memberId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();

  if (params.memberId !== 'new') {
    void queryClient.prefetchQuery(memberByIdOptions(Number(params.memberId)));
  }
  void queryClient.prefetchQuery(myMemberOptions());

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MemberViewPage memberId={params.memberId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
