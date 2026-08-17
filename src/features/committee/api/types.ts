export type { CommitteeMember } from '@/constants/abto-data';

export type CommitteeFilters = { search?: string };

export type CommitteeListResponse = {
  success: boolean;
  message?: string;
  committee: import('@/constants/abto-data').CommitteeMember[];
};

export type CommitteeResponse = {
  success: boolean;
  message?: string;
  member: import('@/constants/abto-data').CommitteeMember;
};

export type CommitteeMutationPayload = {
  name: string;
  title: string;
  seat_order: number;
  photo_url: string | null;
  is_vacant: 0 | 1;
};
