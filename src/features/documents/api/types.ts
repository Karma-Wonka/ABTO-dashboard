import * as z from 'zod';

export type { Document } from '@/constants/abto-data';

export type DocumentFilters = {
  search?: string;
  kind?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type DocumentsListResponse = {
  success: boolean;
  message?: string;
  documents: import('@/constants/abto-data').Document[];
  total_documents: number;
};

export type DocumentResponse = {
  success: boolean;
  message?: string;
  document: import('@/constants/abto-data').Document;
};

export type DocumentMutationPayload = {
  kind: 'download' | 'publication';
  title: string;
  category: string | null;
  doc_type: string;
  size: string | null;
  year: string | null;
  description: string | null;
  image_key: string | null;
  file_key: string | null;
};

export const documentPayloadSchema = z.object({
  kind: z.enum(['download', 'publication']),
  title: z.string().min(1),
  category: z.string().nullable(),
  doc_type: z.string().min(1),
  size: z.string().nullable(),
  year: z.string().nullable(),
  description: z.string().nullable(),
  image_key: z.string().nullable(),
  file_key: z.string().nullable()
}) satisfies z.ZodType<DocumentMutationPayload>;
