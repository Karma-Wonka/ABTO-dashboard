import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { updateSiteContent } from './service';
import { siteContentKeys } from './queries';
import type { SiteContent } from './types';

export const updateSiteContentMutation = mutationOptions({
  mutationFn: (patch: Partial<SiteContent>) => updateSiteContent(patch),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: siteContentKeys.all })
});
