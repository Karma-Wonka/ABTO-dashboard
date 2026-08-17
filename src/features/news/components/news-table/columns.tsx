'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { NewsPost } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { AdminRowActions } from '@/components/admin/admin-row-actions';
import { deleteNewsMutation } from '../../api/mutations';

export const columns: ColumnDef<NewsPost>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<NewsPost, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.title}</span>,
    meta: {
      label: 'Title',
      placeholder: 'Search news...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }: { column: Column<NewsPost, unknown> }) => (
      <DataTableColumnHeader column={column} title='Date' />
    )
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }: { column: Column<NewsPost, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ cell }) => <Badge variant='secondary'>{cell.getValue<NewsPost['category']>()}</Badge>
  },
  {
    id: 'actions',
    enableHiding: false,
    header: ({ column }: { column: Column<NewsPost, unknown> }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => (
      <AdminRowActions
        id={row.original.id}
        basePath='/dashboard/news'
        editPermission='news:write'
        deletePermission='news:delete'
        deleteMutationOptions={deleteNewsMutation}
      />
    )
  }
];
