import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCommitteeMember, updateCommitteeMember, deleteCommitteeMember } from './service';
import { committeeKeys } from './queries';
import type { CommitteeMutationPayload } from './types';

export const createCommitteeMutation = mutationOptions({
  mutationFn: (data: CommitteeMutationPayload) => createCommitteeMember(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: committeeKeys.all })
});

export const updateCommitteeMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CommitteeMutationPayload }) =>
    updateCommitteeMember(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: committeeKeys.all })
});

export const deleteCommitteeMutation = mutationOptions({
  mutationFn: (id: number) => deleteCommitteeMember(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: committeeKeys.all })
});
