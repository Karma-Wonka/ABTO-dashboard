'use client';

import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { useRole } from '@/hooks/use-role';
import { accountsQueryOptions } from '../api/queries';
import { updateAccountRoleMutation, deleteAccountMutation } from '../api/mutations';
import { rolesQueryOptions } from '@/features/roles/api/queries';
import { ResetPasswordDialog } from './reset-password-dialog';
import type { Account } from '../api/types';

export function AccountTable() {
  const { email: myEmail } = useRole();
  const { data } = useSuspenseQuery(accountsQueryOptions());
  const { data: rolesData } = useSuspenseQuery(rolesQueryOptions());
  const accounts = data.accounts;
  const roleOptions = rolesData.roles.map((r) => ({ value: r.name, label: r.name }));
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [resetTarget, setResetTarget] = useState<Account | null>(null);

  const roleMutation = useMutation({
    ...updateAccountRoleMutation,
    onSuccess: () => toast.success('Role updated'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update role')
  });

  const deleteMutation = useMutation({
    ...deleteAccountMutation,
    onSuccess: () => {
      toast.success('Account deleted');
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
      setPendingDelete(null);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts ({accounts.length})</CardTitle>
        <CardDescription>
          Everyone who has signed in to the dashboard. Assign a role to control what they can do.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertModal
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => pendingDelete !== null && deleteMutation.mutate(pendingDelete)}
          loading={deleteMutation.isPending}
        />
        <ResetPasswordDialog
          account={resetTarget}
          open={resetTarget !== null}
          onOpenChange={(open) => !open && setResetTarget(null)}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const isMe = account.email.toLowerCase() === myEmail?.toLowerCase();
              return (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {account.name || account.email}
                        {isMe && <span className='text-muted-foreground ml-2 text-xs'>(you)</span>}
                      </span>
                      <span className='text-muted-foreground text-xs'>{account.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      items={roleOptions}
                      value={account.role}
                      disabled={isMe || roleMutation.isPending}
                      onValueChange={(role) => {
                        if (!role) return;
                        roleMutation.mutate({ id: account.id, values: { role } });
                      }}
                    >
                      <SelectTrigger className='w-40'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Reset password'
                      onClick={() => setResetTarget(account)}
                    >
                      <Icons.lock className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      disabled={isMe}
                      title={isMe ? 'Use Profile to delete your own account' : 'Delete account'}
                      onClick={() => setPendingDelete(account.id)}
                    >
                      <Icons.trash className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className='text-muted-foreground text-center'>
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function AccountTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-64 w-full rounded-lg' />
    </div>
  );
}
