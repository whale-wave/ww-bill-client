import React, { useState } from 'react';
import Top from '@/pages/Chart/top';
import Tag from '@/pages/Chart/tag';

const DemoLine: React.FC = () => {
  const [status] = useState('2');

  return (
    <div className="page">
      <Top statusDetails={status}></Top>
      <Tag></Tag>
    </div>
  );
};

export default DemoLine;
