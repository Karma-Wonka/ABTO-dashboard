import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { updateAccountRole, deleteAccount, resetPassword } from './service';
import { accountKeys } from './queries';
import type { RoleAssignmentPayload, ResetPasswordPayload } from './types';

export const updateAccountRoleMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: RoleAssignmentPayload }) =>
    updateAccountRole(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: accountKeys.all })
});

export const deleteAccountMutation = mutationOptions({
  mutationFn: (id: number) => deleteAccount(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: accountKeys.all })
});

export const resetPasswordMutation = mutationOptions({
  mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload)
});
