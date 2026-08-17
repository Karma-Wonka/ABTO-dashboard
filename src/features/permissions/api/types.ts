import * as z from 'zod';

export type { Permission } from '@/constants/rbac-data';

export type PermissionMutationPayload = {
  key: string;
  resource: string;
  action: string;
  description: string;
};

export const permissionPayloadSchema = z.object({
  key: z.string().min(2),
  resource: z.string().min(1),
  action: z.string().min(1),
  description: z.string()
}) satisfies z.ZodType<PermissionMutationPayload>;

export type PermissionsResponse = {
  success: boolean;
  message?: string;
  permissions: import('@/constants/rbac-data').Permission[];
};

export type PermissionResponse = {
  success: boolean;
  message?: string;
  permission: import('@/constants/rbac-data').Permission | null;
};
