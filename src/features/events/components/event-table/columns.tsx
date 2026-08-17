'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Event } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { AdminRowActions } from '@/components/admin/admin-row-actions';
import { deleteEventMutation } from '../../api/mutations';
import { EVENT_TYPE_OPTIONS } from '@/features/events/schemas/event';

const IS_PAST_OPTIONS = [
  { label: 'Upcoming', value: '0' },
  { label: 'Past', value: '1' }
];

export const columns: ColumnDef<Event>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Event, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.title}</span>
        <span className='text-muted-foreground text-xs'>{row.original.location}</span>
      </div>
    ),
    meta: {
      label: 'Title',
      placeholder: 'Search events...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }: { column: Column<Event, unknown> }) => (
      <DataTableColumnHeader column={column} title='Date' />
    )
  },
  {
    id: 'type',
    accessorKey: 'type',
    enableSorting: false,
    header: 'TYPE',
    cell: ({ cell }) => <Badge variant='secondary'>{cell.getValue<Event['type']>()}</Badge>,
    enableColumnFilter: true,
    meta: {
      label: 'Type',
      variant: 'multiSelect' as const,
      options: EVENT_TYPE_OPTIONS
    }
  },
  {
    accessorKey: 'capacity',
    header: 'CAPACITY'
  },
  {
    id: 'is_past',
    accessorKey: 'is_past',
    header: 'STATUS',
    cell: ({ cell }) => {
      const isPast = cell.getValue<Event['is_past']>();
      return <Badge variant={isPast ? 'outline' : 'default'}>{isPast ? 'Past' : 'Upcoming'}</Badge>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect' as const,
      options: IS_PAST_OPTIONS
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    header: ({ column }: { column: Column<Event, unknown> }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => (
      <AdminRowActions
        id={row.original.id}
        basePath='/dashboard/events'
        editPermission='events:write'
        deletePermission='events:delete'
        deleteMutationOptions={deleteEventMutation}
      />
    )
  }
];
