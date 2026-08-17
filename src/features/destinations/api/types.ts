export type { Destination } from '@/constants/abto-data';

export type DestinationFilters = { search?: string; kind?: string };

export type DestinationListResponse = {
  success: boolean;
  message?: string;
  destinations: import('@/constants/abto-data').Destination[];
};

export type DestinationResponse = {
  success: boolean;
  message?: string;
  destination: import('@/constants/abto-data').Destination;
};

export type DestinationMutationPayload = {
  kind: 'place' | 'druk_air' | 'tashi_air';
  name: string;
  tagline: string | null;
  description: string;
  image_url: string | null;
  seat_order: number;
};
