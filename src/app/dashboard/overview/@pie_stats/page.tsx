import dynamic from 'next/dynamic';

const PieGraph = dynamic(() =>
  import('@/features/overview/components/pie-graph').then((m) => m.PieGraph)
);

export default function Stats() {
  return <PieGraph />;
}
