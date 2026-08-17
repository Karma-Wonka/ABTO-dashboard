import * as z from 'zod';

export type { Role } from '@/constants/rbac-data';

export type RoleMutationPayload = {
  name: string;
  description: string;
};

export const rolePayloadSchema = z.object({
  name: z.string().min(2),
  description: z.string()
}) satisfies z.ZodType<RoleMutationPayload>;

export const setPermissionsPayloadSchema = z.object({
  permissions: z.array(z.string())
});

export type SetPermissionsPayload = z.infer<typeof setPermissionsPayloadSchema>;

export type RolesResponse = {
  success: boolean;
  message?: string;
  roles: import('@/constants/rbac-data').Role[];
};

export type RoleResponse = {
  success: boolean;
  message?: string;
  role: import('@/constants/rbac-data').Role | null;
};
