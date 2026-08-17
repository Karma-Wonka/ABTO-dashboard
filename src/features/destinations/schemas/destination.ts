import * as z from 'zod';

export const destinationSchema = z.object({
  kind: z.string().min(1, 'Please select a kind.'),
  name: z.string().min(1, 'Name is required.'),
  tagline: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image_url: z.string(),
  seat_order: z.number({ message: 'Display order is required' })
});

export type DestinationFormValues = {
  kind: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  seat_order: number | undefined;
};

export const DESTINATION_KIND_OPTIONS = [
  { label: 'Bhutan Place (Travel page — Planning Your Trip)', value: 'place' },
  { label: 'Druk Air Gateway', value: 'druk_air' },
  { label: 'Tashi Air Destination', value: 'tashi_air' }
];
