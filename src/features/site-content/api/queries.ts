import { queryOptions } from '@tanstack/react-query';
import { getSiteContent } from './service';

export const siteContentKeys = {
  all: ['site-content'] as const
};

export const siteContentQueryOptions = () =>
  queryOptions({
    queryKey: siteContentKeys.all,
    queryFn: getSiteContent
  });
