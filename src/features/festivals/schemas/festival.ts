import * as z from 'zod';

export const festivalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  place: z.string().min(2, 'Place is required.'),
  dzongkhag: z.string().min(2, 'Dzongkhag is required.'),
  date_2025: z.string(),
  date_2026: z.string(),
  display_order: z.number({ message: 'Display order is required' })
});

export type FestivalFormValues = {
  name: string;
  place: string;
  dzongkhag: string;
  date_2025: string;
  date_2026: string;
  display_order: number | undefined;
};
