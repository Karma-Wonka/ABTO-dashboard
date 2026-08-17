'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { NewsPost } from '../api/types';
import NewsForm from './news-form';
import { newsByIdOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function NewsViewPage({ newsId }: { newsId: string }) {
  const { can, isLoading } = useRole();
  if (isLoading) return null;
  if (!can('news:write')) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can publish news.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (newsId === 'new') {
    return <NewsForm initialData={null} pageTitle='New Post' />;
  }
  return <EditNewsView newsId={Number(newsId)} />;
}

function EditNewsView({ newsId }: { newsId: number }) {
  const { data } = useSuspenseQuery(newsByIdOptions(newsId));
  if (!data?.success || !data?.post) notFound();
  return <NewsForm initialData={data.post as NewsPost} pageTitle='Edit Post' />;
}
