import * as z from 'zod';

export const committeeSchema = z.object({
  name: z.string(),
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  seat_order: z.number({ message: 'Seat order is required' }),
  photo_url: z.string(),
  is_vacant: z.string()
});

export type CommitteeFormValues = {
  name: string;
  title: string;
  seat_order: number | undefined;
  photo_url: string;
  is_vacant: string;
};

export const VACANT_OPTIONS = [
  { label: 'Filled', value: '0' },
  { label: 'Vacant', value: '1' }
];
