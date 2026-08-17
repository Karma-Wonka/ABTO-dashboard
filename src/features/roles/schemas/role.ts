import * as z from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string()
});

export type RoleFormValues = z.infer<typeof roleSchema>;
