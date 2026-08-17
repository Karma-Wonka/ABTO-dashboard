'use client';

import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { barY, defineChart } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { overviewStatsQueryOptions } from '../api/queries';

export function BarGraph() {
  const { data: stats } = useSuspenseQuery(overviewStatsQueryOptions());
  const rows = stats.membersByRegion;

  const barChart = useMemo(
    () =>
      defineChart({
        marks: [
          barY(rows, {
            x: 'label',
            y: 'count',
            radius: 6,
            maxThickness: 42,
            fill: 'var(--chart-1)'
          })
        ],
        x: { scale: () => scaleBand<string>().padding(0.3) },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true
        },
        tooltip
      }),
    [rows]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members by Region</CardTitle>
        <CardDescription>Distribution of registered members across regions</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <Chart
            definition={barChart}
            height={300}
            ariaLabel='Bar chart of member counts by region'
          />
        ) : (
          <p className='text-muted-foreground py-16 text-center text-sm'>No members yet</p>
        )}
      </CardContent>
    </Card>
  );
}
