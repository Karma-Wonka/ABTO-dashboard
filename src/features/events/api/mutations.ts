import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createEvent, updateEvent, deleteEvent } from './service';
import { eventKeys } from './queries';
import type { EventMutationPayload } from './types';

export const createEventMutation = mutationOptions({
  mutationFn: (data: EventMutationPayload) => createEvent(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: eventKeys.all })
});

export const updateEventMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: EventMutationPayload }) =>
    updateEvent(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: eventKeys.all })
});

export const deleteEventMutation = mutationOptions({
  mutationFn: (id: number) => deleteEvent(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: eventKeys.all })
});
