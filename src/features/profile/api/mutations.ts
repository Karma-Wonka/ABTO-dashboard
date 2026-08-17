import { mutationOptions } from '@tanstack/react-query';
import { updateName, updatePassword } from './service';
import type { PasswordPayload } from '../schemas/profile';

export const updateNameMutation = mutationOptions({
  mutationFn: (name: string) => updateName(name)
});

export const updatePasswordMutation = mutationOptions({
  mutationFn: (data: PasswordPayload) => updatePassword(data)
});
