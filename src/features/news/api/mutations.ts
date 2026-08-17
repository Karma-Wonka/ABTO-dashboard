import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createNews, updateNews, deleteNews } from './service';
import { newsKeys } from './queries';
import type { NewsMutationPayload } from './types';

export const createNewsMutation = mutationOptions({
  mutationFn: (data: NewsMutationPayload) => createNews(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: newsKeys.all })
});

export const updateNewsMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: NewsMutationPayload }) =>
    updateNews(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: newsKeys.all })
});

export const deleteNewsMutation = mutationOptions({
  mutationFn: (id: number) => deleteNews(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: newsKeys.all })
});
