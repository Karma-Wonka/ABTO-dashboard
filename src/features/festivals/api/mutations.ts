import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createFestival,
  updateFestival,
  deleteFestival,
  uploadFestivalCalendarPdf,
  removeFestivalCalendarPdf
} from './service';
import { festivalKeys } from './queries';
import type { FestivalMutationPayload } from './types';

export const createFestivalMutation = mutationOptions({
  mutationFn: (data: FestivalMutationPayload) => createFestival(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: festivalKeys.all })
});

export const updateFestivalMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: FestivalMutationPayload }) =>
    updateFestival(id, values),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: festivalKeys.all })
});

export const deleteFestivalMutation = mutationOptions({
  mutationFn: (id: number) => deleteFestival(id),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: festivalKeys.all })
});

export const uploadFestivalCalendarPdfMutation = mutationOptions({
  mutationFn: (file: File) => uploadFestivalCalendarPdf(file),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: festivalKeys.pdf() })
});

export const removeFestivalCalendarPdfMutation = mutationOptions({
  mutationFn: () => removeFestivalCalendarPdf(),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: festivalKeys.pdf() })
});
