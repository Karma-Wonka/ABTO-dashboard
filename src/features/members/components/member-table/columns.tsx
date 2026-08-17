'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Member } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { STATUS_OPTIONS } from '@/features/members/schemas/member';
import { MemberCellAction } from '../member-cell-action';

export function buildColumns(myId: number | undefined, canWrite: boolean): ColumnDef<Member>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<Member, unknown> }) => (
        <DataTableColumnHeader column={column} title='Company' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>
            {row.original.name}
            {row.original.id === myId && (
              <Badge variant='outline' className='ml-2'>
                You
              </Badge>
            )}
          </span>
          <span className='text-muted-foreground text-xs'>{row.original.email || '—'}</span>
        </div>
      ),
      meta: {
        label: 'Company',
        placeholder: 'Search members...',
        variant: 'text' as const,
        icon: Icons.text
      },
      enableColumnFilter: true
    },
    {
      accessorKey: 'region',
      header: 'REGION'
    },
    {
      id: 'specialties',
      accessorKey: 'specialties',
      enableSorting: false,
      header: 'SPECIALTIES',
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original.specialties.map((s) => (
            <Badge key={s} variant='secondary' className='text-xs'>
              {s}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'member_since',
      accessorKey: 'member_since',
      header: ({ column }: { column: Column<Member, unknown> }) => (
        <DataTableColumnHeader column={column} title='Since' />
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }: { column: Column<Member, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ cell }) => (
        <Badge
          variant={cell.getValue<Member['status']>() === 'active' ? 'default' : 'outline'}
          className='capitalize'
        >
          {cell.getValue<Member['status']>()}
        </Badge>
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'multiSelect' as const,
        options: STATUS_OPTIONS
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      header: ({ column }: { column: Column<Member, unknown> }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <MemberCellAction
          data={row.original}
          canWrite={canWrite}
          isMine={row.original.id === myId}
        />
      )
    }
  ];
}
