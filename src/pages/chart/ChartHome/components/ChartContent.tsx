import type { FC } from 'react';
import { ErrorBlock } from 'antd-mobile';
import { LineChart, RankingList } from '@/pages/chart/ChartHome/components';
import { useChartHome } from '@/pages/chart/ChartHome/model/chart-home-context';
import { cn } from '@/shared/lib';

export const ChartContent: FC = () => {
  const { curTab, currentAmountType } = useChartHome();

  const empty = (
    <div className={cn('flex-grow flex items-center justify-center')}>
      <ErrorBlock status="empty" title="快去记一笔吧~" description='点击 "记账" 按钮，开始记录你的财务数据.' />
    </div>
  );

  return (
    <div className={cn('fixed left-0 right-0 top-[calc(42.94px+42.4px+37.55px)] h-[calc(100%-42.94px-42.4px-37.55px-60px)] overflow-y-auto')}>
      {!curTab
        ? empty
        : (
            <div className={cn('flex flex-col z-10 pb-10')}>
              <div className={cn('flex flex-col py-2 px-1 border-0 border-b-[1px] border-b-gray-100 border-solid flex-shrink-0')}>
                <div className={cn('flex flex-col px-1')}>
                  <div className={cn('text-sm flex space-x-2')}>
                    <div>{currentAmountType === 'sub' ? '总支出:' : '总收入:'}</div>
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
            </div>
          )}
    </div>
  );
};
