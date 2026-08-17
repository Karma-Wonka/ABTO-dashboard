import * as z from 'zod';

export type { Event } from '@/constants/abto-data';

export type EventFilters = {
  search?: string;
  type?: string;
  is_past?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type EventsResponse = {
  success: boolean;
  message?: string;
  events: import('@/constants/abto-data').Event[];
  total_events: number;
};

export type EventResponse = {
  success: boolean;
  message?: string;
  event: import('@/constants/abto-data').Event;
};

export type EventMutationPayload = {
  date: string;
  title: string;
  location: string;
  type: string;
  description: string;
  capacity: number;
  is_past: 0 | 1;
  detail_link: string | null;
};

export const eventPayloadSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  type: z.string().min(1),
  description: z.string(),
  capacity: z.number(),
  is_past: z.union([z.literal(0), z.literal(1)]),
  detail_link: z.string().nullable()
}) satisfies z.ZodType<EventMutationPayload>;
