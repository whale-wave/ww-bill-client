import type { FC } from 'react';
import { LineChart, RankingList } from '@/pages/Chart/ChartHome/components';
import { cn } from '@/utils';

export const ChartContent: FC = () => {
  return (
    <div className={cn('flex flex-col h-[calc(100vh-42.94px-42.4px-37.55px-60px)]')}>
      <div className={cn('flex flex-col py-2 px-1 border-0 border-b-[1px] border-b-gray-100 border-solid')}>
        <div className={cn('flex flex-col px-1')}>
          <div className={cn('text-sm')}>
            总支出: xxxx.xx
          </div>
          <div>
            平均值: xxx.xx
          </div>
        </div>
        <LineChart />
      </div>
      <RankingList />
    </div>
  );
};
