export type { Submission } from '@/constants/abto-data';

export type SubmissionFilters = { kind?: string };

export type SubmissionListResponse = {
  success: boolean;
  message?: string;
  submissions: import('@/constants/abto-data').Submission[];
};
