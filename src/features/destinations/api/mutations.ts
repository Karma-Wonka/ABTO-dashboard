import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createDestination, updateDestination, deleteDestination } from './service';
import { destinationKeys } from './queries';
import type { DestinationMutationPayload } from './types';

export const createDestinationMutation = mutationOptions({
  mutationFn: (data: DestinationMutationPayload) => createDestination(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: destinationKeys.all })
});

export const updateDestinationMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: DestinationMutationPayload }) =>
    updateDestination(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: destinationKeys.all })
});

export const deleteDestinationMutation = mutationOptions({
  mutationFn: (id: number) => deleteDestination(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: destinationKeys.all })
});
