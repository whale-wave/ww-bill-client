import type { FC } from 'react';
import { ErrorBlock } from 'antd-mobile';
import { LineChart, RankingList } from '@/pages/Chart/ChartHome/components';
import { cn } from '@/utils';
import { useChartStore } from '@/store/chart';

export const ChartContent: FC = () => {
  const curTab = useChartStore(state => state.curTab);

  const empty = (
    <div className={cn('flex-grow flex items-center justify-center')}>
      <ErrorBlock status="empty" title="快去记一笔吧~" description='点击 "记账" 按钮，开始记录你的财务数据.' />
    </div>
  );

  return (
    <div className={cn('flex flex-col h-[calc(100vh-42.94px-42.4px-37.55px-60px)] overflow-auto pb-10')}>
      {!curTab
        ? empty
        : (
            <>
              <div className={cn('flex flex-col py-2 px-1 border-0 border-b-[1px] border-b-gray-100 border-solid')}>
                <div className={cn('flex flex-col px-1')}>
                  <div className={cn('text-sm flex space-x-2')}>
                    <div>总支出:</div>
                    <div>{curTab.amount}</div>
                  </div>
                  <div className={cn('text-sm flex space-x-2')}>
                    <div>平均值:</div>
                    <div>{curTab.average}</div>
                  </div>
                </div>
                <LineChart />
              </div>
              <RankingList />
            </>
          )}
    </div>
  );
};
