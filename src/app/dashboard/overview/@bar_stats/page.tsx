import dynamic from 'next/dynamic';

const BarGraph = dynamic(() =>
  import('@/features/overview/components/bar-graph').then((m) => m.BarGraph)
);

export default function BarStats() {
  return <BarGraph />;
}
