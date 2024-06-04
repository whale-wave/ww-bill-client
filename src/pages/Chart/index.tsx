import React, { useEffect, useState } from 'react';
import { TabBar } from '@/components';
import Top from '@/pages/Chart/top';
import Tag from '@/pages/Chart/tag';
// import { chartListApi } from '@/api/chart';
import { useGetChartQuery } from '@/hooks';
import { useChartStore } from '@/store/chartStore';

const DemoLine: React.FC = () => {
  const [status] = useState('1');
  const { data } = useGetChartQuery({
    params: {
      type: 'sub',
      category: 'year',
    },
  });

  const { setChartData } = useChartStore(({ setChartData }) => ({
    setChartData,
  }));

  useEffect(() => {
    console.log('liang fuck', data);
    setChartData(data);
  }, [data]);

  return (
    <div className="page">
      <Top statusDetails={status}></Top>
      <Tag></Tag>
      <TabBar active={1} />
    </div>
  );
};

export default DemoLine;
