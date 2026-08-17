import * as z from 'zod';

export type { Member } from '@/constants/abto-data';

export type MemberFilters = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type MembersResponse = {
  success: boolean;
  message?: string;
  members: import('@/constants/abto-data').Member[];
  total_members: number;
};

export type MemberResponse = {
  success: boolean;
  message?: string;
  member: import('@/constants/abto-data').Member | null;
};

export type MemberMutationPayload = {
  name: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  languages: string[];
  member_since: number;
  status: 'active' | 'pending';
};

export const memberPayloadSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  website: z.string(),
  description: z.string(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  member_since: z.number(),
  status: z.enum(['active', 'pending'])
}) satisfies z.ZodType<MemberMutationPayload>;
