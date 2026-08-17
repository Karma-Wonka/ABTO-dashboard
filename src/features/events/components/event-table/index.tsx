'use client';

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
import { eventsQueryOptions } from '../../api/queries';
import { columns } from './columns';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function EventsTable() {
  const router = useRouter();
  const { can } = useRole();
  const canWrite = can('events:write');

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    title: parseAsString,
    type: parseAsString,
    is_past: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.title && { search: params.title }),
    ...(params.type && { type: params.type }),
    ...(params.is_past && { is_past: params.is_past }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(eventsQueryOptions(filters));
  const pageCount = Math.ceil(data.total_events / params.perPage);

  const { table } = useDataTable({
    data: data.events,
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
          <Button onClick={() => router.push('/dashboard/events/new')}>
            <Icons.plusCircle className='mr-2 h-4 w-4' /> New Event
          </Button>
        )}
      </DataTableToolbar>
    </DataTable>
  );
}

export function EventsTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
