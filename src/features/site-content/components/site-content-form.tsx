'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { siteContentQueryOptions } from '../api/queries';
import { SITE_CONTENT_TABS } from '../constants/sections';
import { ScalarSectionForm } from './scalar-section-form';
import { ListSectionForm } from './list-section-form';

export default function SiteContentForm() {
  const { data } = useSuspenseQuery(siteContentQueryOptions());
  const content = data.content;

  return (
    <Tabs defaultValue={SITE_CONTENT_TABS[0].value} className='w-full'>
      <TabsList>
        {SITE_CONTENT_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SITE_CONTENT_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className='space-y-6 pt-4'>
          {tab.sections.map((section) =>
            section.kind === 'scalar' ? (
              <ScalarSectionForm
                key={section.key}
                sectionKey={section.key}
                title={section.title}
                description={section.description}
                fields={section.fields}
                initialValue={(content[section.key] as Record<string, unknown>) ?? {}}
              />
            ) : (
              <ListSectionForm
                key={section.key}
                sectionKey={section.key}
                title={section.title}
                description={section.description}
                fields={section.fields}
                emptyItem={section.emptyItem}
                itemLabel={section.itemLabel}
                initialItems={(content[section.key] as Record<string, unknown>[]) ?? []}
              />
            )
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
