import React, { useEffect, useState } from 'react';
import { TabBar } from '@/components';
import Top from '@/pages/Chart/top';
import Tag from '@/pages/Chart/tag';
import { chartListApi } from '@/api/chart';

const DemoLine: React.FC = () => {
  const [status] = useState('1');

  const pageList = async () => {
    const data = {
      type: 'sub',
      category: 'year',
    };
    const res = await chartListApi(data);
    console.log(res, '图表数据');
  };

  useEffect(() => {
    console.log('liang fuck');
    pageList();
  });

  return (
    <div className="page">
      <Top statusDetails={status}></Top>
      <Tag></Tag>
      <TabBar active={1} />
    </div>
  );
};

export default DemoLine;
