import React from 'react';
import { TabBar } from '@/components';
import Top from '@/pages/Chart/top';
import Tag from '@/pages/Chart/tag';

const DemoLine: React.FC = () => {
  return (
    <div className="page">
      <Top></Top>
      <Tag></Tag>
      <TabBar active={1} />
    </div>
  );
};

export default DemoLine;
