import * as z from 'zod';

export const permissionSchema = z.object({
  key: z
    .string()
    .min(2, 'Key must be at least 2 characters.')
    .regex(
      /^[a-z0-9_]+:[a-z0-9_]+$/,
      "Key must look like 'resource:action' (lowercase, no spaces)."
    ),
  resource: z.string().min(1, 'Resource is required.'),
  action: z.string().min(1, 'Action is required.'),
  description: z.string()
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;
