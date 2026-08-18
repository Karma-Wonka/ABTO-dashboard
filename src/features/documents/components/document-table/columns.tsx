'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Document } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { AdminRowActions } from '@/components/admin/admin-row-actions';
import { deleteDocumentMutation } from '../../api/mutations';

const KIND_OPTIONS = [
  { label: 'Download', value: 'download' },
  { label: 'Publication', value: 'publication' }
];

export const columns: ColumnDef<Document>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Document, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.title}</span>,
    meta: {
      label: 'Title',
      placeholder: 'Search documents...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: 'KIND',
    cell: ({ cell }) => (
      <Badge variant={cell.getValue<Document['kind']>() === 'download' ? 'default' : 'secondary'}>
        {cell.getValue<Document['kind']>()}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Kind',
      variant: 'multiSelect' as const,
      options: KIND_OPTIONS
    }
  },
  {
    accessorKey: 'doc_type',
    header: 'TYPE'
  },
  {
    id: 'categoryOrYear',
    header: 'CATEGORY / YEAR',
    cell: ({ row }) => row.original.category ?? row.original.year ?? '—'
  },
  {
    accessorKey: 'size',
    header: 'SIZE',
    cell: ({ cell }) => cell.getValue<Document['size']>() ?? '—'
  },
  {
    id: 'actions',
    enableHiding: false,
    header: ({ column }: { column: Column<Document, unknown> }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => (
      <AdminRowActions
        id={row.original.id}
        basePath='/dashboard/documents'
        editPermission='documents:write'
        deletePermission='documents:delete'
        deleteMutationOptions={deleteDocumentMutation}
      />
    )
  }
];
