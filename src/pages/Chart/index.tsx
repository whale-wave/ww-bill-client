import React from 'react';
import ChartLine from '@/pages/Chart/chartLine';
import { TabBar } from '@/components';
import Top from '@/pages/Chart/top';
import List from '@/pages/Chart/list';

const DemoLine: React.FC = () => {
  return (
    <div className="page">
      <Top></Top>
      <ChartLine></ChartLine>
      <List></List>
      <TabBar active={1} />
    </div>
  );
};

export default DemoLine;
