'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { overviewStatsQueryOptions } from '../api/queries';
import type { OverviewStats } from '../api/types';

type CardSpec = {
  label: string;
  value: string;
  caption: string;
  icon: keyof typeof Icons;
  accent: string;
};

function buildCards(stats: OverviewStats): CardSpec[] {
  return [
    {
      label: 'Total Members',
      value: String(stats.members.total),
      caption:
        stats.members.pending > 0
          ? `${stats.members.active} active · ${stats.members.pending} pending`
          : `${stats.members.active} active`,
      icon: 'teams',
      accent: 'var(--chart-1)'
    },
    {
      label: 'Upcoming Events',
      value: String(stats.events.upcoming),
      caption: stats.events.nextEvent
        ? `Next: ${stats.events.nextEvent.title}`
        : 'No events scheduled',
      icon: 'calendar',
      accent: 'var(--chart-2)'
    },
    {
      label: 'Published News',
      value: String(stats.news.total),
      caption: stats.news.latest ? `Latest: ${stats.news.latest.title}` : 'No news posted yet',
      icon: 'post',
      accent: 'var(--chart-3)'
    },
    {
      label: 'Documents',
      value: String(stats.documents.total),
      caption: `${stats.documents.downloads} downloads · ${stats.documents.publications} publications`,
      icon: 'forms',
      accent: 'var(--chart-4)'
    }
  ];
}

function MetricCard({ card }: { card: CardSpec }) {
  const Icon = Icons[card.icon];

  return (
    <Card className='gap-0 py-0'>
      <CardContent className='flex items-start gap-4 p-5'>
        <div
          className='flex size-10 shrink-0 items-center justify-center rounded-full'
          style={{
            backgroundColor: `color-mix(in oklch, ${card.accent} 14%, transparent)`,
            color: card.accent
          }}
        >
          <Icon className='size-5' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-muted-foreground text-sm'>{card.label}</p>
          <div className='mt-1'>
            <span className='text-2xl font-semibold tabular-nums'>{card.value}</span>
          </div>
          <p className='text-muted-foreground mt-1 truncate text-xs'>{card.caption}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewCards() {
  const { data: stats } = useSuspenseQuery(overviewStatsQueryOptions());
  const cards = buildCards(stats);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <MetricCard key={card.label} card={card} />
      ))}
    </div>
  );
}

export function OverviewCardsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='gap-0 py-0'>
          <CardContent className='flex items-start gap-4 p-5'>
            <Skeleton className='size-10 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-3.5 w-24' />
              <Skeleton className='h-6 w-16' />
              <Skeleton className='h-3 w-32' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
