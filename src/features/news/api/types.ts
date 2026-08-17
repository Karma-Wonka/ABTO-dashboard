import * as z from 'zod';

export type { NewsPost } from '@/constants/abto-data';

export type NewsFilters = { search?: string; page?: number; limit?: number; sort?: string };

export type NewsListResponse = {
  success: boolean;
  message?: string;
  news: import('@/constants/abto-data').NewsPost[];
  total_news: number;
};

export type NewsResponse = {
  success: boolean;
  message?: string;
  post: import('@/constants/abto-data').NewsPost;
};

export type NewsMutationPayload = {
  date: string;
  category: string;
  title: string;
  body: string;
  image_url: string | null;
};

export const newsPayloadSchema = z.object({
  date: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  body: z.string(),
  image_url: z.string().nullable()
}) satisfies z.ZodType<NewsMutationPayload>;
