import type { FC } from 'react';
import { useVisibleAmount } from '@/entities/user-app-config';
import { ChartDashboardHome } from '@/widgets/chart-dashboard';
import { TabBar } from '@/widgets/layout';

const ChartHomeInner: FC = () => {
  const { isVisibleAmount } = useVisibleAmount();
  return (
    <>
      <ChartDashboardHome hideAmounts={!isVisibleAmount} scope={{ kind: 'personal' }} defaultPeriod="week" />
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
