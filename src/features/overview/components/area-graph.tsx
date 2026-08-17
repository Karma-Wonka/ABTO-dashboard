'use client';

import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { areaY, defineChart, ruleY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { overviewStatsQueryOptions } from '../api/queries';

export function AreaGraph() {
  const { data: stats } = useSuspenseQuery(overviewStatsQueryOptions());
  const rows = stats.membershipGrowth;

  const areaChart = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(rows, {
            x: 'year',
            y: 'members',
            fillOpacity: 0.7,
            strokeWidth: 1.5,
            fill: 'var(--chart-1)',
            stroke: 'var(--chart-1)'
          }),
          ruleY([0])
        ],
        x: { scale: () => scalePoint<string>().padding(0.2) },
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
        <CardTitle>Membership Growth</CardTitle>
        <CardDescription>Cumulative registered members by year joined</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <Chart
            definition={areaChart}
            height={300}
            ariaLabel='Area chart of cumulative membership growth by year'
          />
        ) : (
          <p className='text-muted-foreground py-16 text-center text-sm'>No members yet</p>
        )}
      </CardContent>
    </Card>
  );
}
