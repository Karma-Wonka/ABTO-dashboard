'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRole } from '@/hooks/use-role';
import { membersQueryOptions, myMemberOptions } from '../../api/queries';
import { buildColumns } from './columns';

const columnIds = ['name', 'region', 'member_since', 'status'];

export function MembersTable() {
  const router = useRouter();
  const { can } = useRole();
  const canWrite = can('members:write');

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    status: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.status && { status: params.status }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(membersQueryOptions(filters));
  const { data: mine } = useSuspenseQuery(myMemberOptions());
  const myId = mine?.member?.id;

  const columns = useMemo(() => buildColumns(myId, canWrite), [myId, canWrite]);
  const pageCount = Math.ceil(data.total_members / params.perPage);

  const { table } = useDataTable({
    data: data.members,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        {canWrite && (
          <Button onClick={() => router.push('/dashboard/members/new')}>
            <Icons.plusCircle className='mr-2 h-4 w-4' /> Add Member
          </Button>
        )}
      </DataTableToolbar>
    </DataTable>
  );
}

export function MembersTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
