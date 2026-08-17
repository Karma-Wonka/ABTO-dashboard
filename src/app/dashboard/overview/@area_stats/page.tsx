import dynamic from 'next/dynamic';

const AreaGraph = dynamic(() =>
  import('@/features/overview/components/area-graph').then((m) => m.AreaGraph)
);

export default function AreaStats() {
  return <AreaGraph />;
}
