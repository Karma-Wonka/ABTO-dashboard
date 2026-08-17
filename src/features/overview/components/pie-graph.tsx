'use client';

import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { colorLegend, defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { Chart } from '@tanstack/charts/react';
import { tooltip } from '@tanstack/charts/tooltip';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { overviewStatsQueryOptions } from '../api/queries';

export function PieGraph() {
  const { data: stats } = useSuspenseQuery(overviewStatsQueryOptions());
  const rows = stats.membersBySpecialty;
  const labels = rows.map((row) => row.label);

  const pieChart = useMemo(() => {
    const slices = pie(rows, { value: 'count' });
    return defineChart({
      marks: [
        polar({
          inset: 8,
          radiusRatio: 0.82,
          marks: [
            radialArc(slices, {
              innerRadius: ({ radius }) => radius * 0.6,
              cornerRadius: 6,
              padAngle: () => 0.015,
              color: 'label',
              key: 'label'
            })
          ]
        })
      ],
      color: {
        domain: labels,
        range: [
          'var(--chart-1)',
          'var(--chart-2)',
          'var(--chart-3)',
          'var(--chart-4)',
          'var(--chart-5)'
        ],
        legend: colorLegend({ label: 'Specialty' })
      },
      tooltip
    });
  }, [rows, labels]);

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Members by Specialty</CardTitle>
        <CardDescription>Top service specialties among registered members</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        {rows.length > 0 ? (
          <Chart
            definition={pieChart}
            height={300}
            ariaLabel='Donut chart of member counts by top specialties'
          />
        ) : (
          <p className='text-muted-foreground py-16 text-center text-sm'>No members yet</p>
        )}
      </CardContent>
    </Card>
  );
}
