import type { FC } from 'react';
import { TabBar } from '@/components';
import { Top } from '@/pages/Chart/ChartHome/components';

const ChartHome: FC = () => {
  return (
    <>
      <Top />
      {/* <Tag /> */}
      <TabBar active={1} />
    </>
  );
};

export default ChartHome;
