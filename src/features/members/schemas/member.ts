import * as z from 'zod';

export const memberSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters.'),
  region: z.string().min(1, 'Please select a region.'),
  phone: z.string(),
  email: z.string().email('Enter a valid email address.'),
  website: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  specialties: z.string().min(1, 'List at least one specialty.'),
  languages: z.string().min(1, 'List at least one language.'),
  member_since: z.number({ message: 'Member-since year is required' }),
  status: z.string().min(1, 'Please select a status.')
});

// specialties/languages are edited as comma-separated text in the form and
// split into arrays right before the API call — no dedicated multi-select
// field exists in the shared tanstack-form kit yet.
export type MemberFormValues = {
  name: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  specialties: string;
  languages: string;
  member_since: number | undefined;
  status: string;
};

export const REGION_OPTIONS = [
  'Thimphu',
  'Paro',
  'Punakha',
  'Bumthang',
  'Trashigang',
  'Phuentsholing',
  'Gelephu',
  'Wangdue',
  'Haa',
  'Trongsa'
].map((r) => ({ label: r, value: r }));

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' }
];
