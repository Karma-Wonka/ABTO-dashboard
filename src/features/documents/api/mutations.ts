import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createDocument, updateDocument, deleteDocument } from './service';
import { documentKeys } from './queries';
import type { DocumentMutationPayload } from './types';

export const createDocumentMutation = mutationOptions({
  mutationFn: (data: DocumentMutationPayload) => createDocument(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: documentKeys.all })
});

export const updateDocumentMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: DocumentMutationPayload }) =>
    updateDocument(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: documentKeys.all })
});

export const deleteDocumentMutation = mutationOptions({
  mutationFn: (id: number) => deleteDocument(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: documentKeys.all })
});
