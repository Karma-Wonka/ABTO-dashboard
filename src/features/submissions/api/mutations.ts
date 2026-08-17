import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { deleteSubmission } from './service';
import { submissionKeys } from './queries';

export const deleteSubmissionMutation = mutationOptions({
  mutationFn: (id: number) => deleteSubmission(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: submissionKeys.all })
});
