import * as z from 'zod';

export const eventSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  location: z.string().min(1, 'Location is required.'),
  type: z.string().min(1, 'Please select a type.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  capacity: z.number({ message: 'Capacity is required' }),
  is_past: z.string(),
  detail_link: z.string()
});

export type EventFormValues = {
  date: string;
  title: string;
  location: string;
  type: string;
  description: string;
  capacity: number | undefined;
  is_past: string;
  detail_link: string;
};

export const EVENT_TYPE_OPTIONS = [
  'Forum',
  'Briefing',
  'Workshop',
  'Clinic',
  'AGM',
  'Trade Mart'
].map((t) => ({
  label: t,
  value: t
}));

export const EVENT_STATUS_OPTIONS = [
  { label: 'Upcoming', value: '0' },
  { label: 'Past', value: '1' }
];
