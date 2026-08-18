export type { Festival } from '@/constants/abto-data';

export type FestivalFilters = { search?: string };

export type FestivalListResponse = {
  success: boolean;
  message?: string;
  festivals: import('@/constants/abto-data').Festival[];
};

export type FestivalResponse = {
  success: boolean;
  message?: string;
  festival: import('@/constants/abto-data').Festival;
};

export type FestivalMutationPayload = {
  name: string;
  place: string;
  dzongkhag: string;
  date_2025: string | null;
  date_2026: string | null;
  display_order: number;
};

export type FestivalCalendarPdf = { pdf_url: string | null; updated_at: string | null };

export type FestivalCalendarPdfResponse = {
  success: boolean;
  message?: string;
  calendar: FestivalCalendarPdf;
};
