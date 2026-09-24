import type { FC } from 'react';
import { ChartDashboardHome } from '@/pages/chart/chart-home/ChartDashboardHome';
import { TabBar } from '@/widgets/layout';

const ChartHomeInner: FC = () => {
  return (
    <>
      <ChartDashboardHome scope={{ kind: 'personal' }} defaultPeriod="week" />
      <TabBar active={1} />
    </>
  );
};

const ChartHome: FC = () => {
  return (
    <ChartHomeInner />
  );
};

export default ChartHome;
