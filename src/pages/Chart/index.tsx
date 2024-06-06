import React, { useState } from 'react';
import { TabBar } from '@/components';
import Top from '@/pages/Chart/top';
import Tag from '@/pages/Chart/tag';

const DemoLine: React.FC = () => {
  const [status] = useState('1');

  return (
    <div className="page">
      <Top statusDetails={status}></Top>
      <Tag></Tag>
      <TabBar active={1} />
    </div>
  );
};

export default DemoLine;
