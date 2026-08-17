import * as z from 'zod';

export const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.')
});

export type NameFormValues = z.infer<typeof nameSchema>;

export const passwordFormSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string().min(1, 'Confirm your new password.')
});

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// What actually goes over the wire — no confirmPassword (client-only check).
export const passwordPayloadSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters.')
});

export type PasswordPayload = z.infer<typeof passwordPayloadSchema>;
