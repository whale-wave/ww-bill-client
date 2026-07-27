import type { FC } from 'react';
import { ChartOverviewBody } from '@/features/chart-overview';
import { ChartHomeProvider } from '@/pages/chart/chart-home/model/ChartHomeProvider';
import { TabBar } from '@/widgets/layout';

const ChartHomeInner: FC = () => {
  return (
    <>
      <ChartOverviewBody />
      <TabBar active={1} />
    </>
  );
};

const ChartHome: FC = () => {
  return (
    <ChartHomeProvider>
      <ChartHomeInner />
    </ChartHomeProvider>
  );
};

export default ChartHome;
