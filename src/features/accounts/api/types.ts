import * as z from 'zod';

export type Account = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
};

export const roleAssignmentSchema = z.object({
  role: z.string().min(1, 'Please select a role.')
});

export type RoleAssignmentPayload = z.infer<typeof roleAssignmentSchema>;

export type AccountsResponse = {
  success: boolean;
  message?: string;
  accounts: Account[];
};

export type AccountResponse = {
  success: boolean;
  message?: string;
  account: Account;
};

export type ResetPasswordPayload = { email: string; newPassword: string };
