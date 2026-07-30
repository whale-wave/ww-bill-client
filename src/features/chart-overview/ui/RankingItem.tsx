import type { FC } from 'react';
import type { ChartOverviewRankingItem } from '../model/chart-overview-context';
import { List } from 'antd-mobile';
import { useMemo } from 'react';
import { cn } from '@/shared/lib';
import { Icon, ProgressBar } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';

export const RankingItem: FC<{ item: ChartOverviewRankingItem; onClick?: () => void }> = ({ item, onClick }) => {
  const { isAmountHidden = false } = useChartOverview();
  const percent = useMemo(() => {
    return Number(item.percentage) / 100;
  }, [item.percentage]);

  return (
    <List.Item
      className="!pl-3 text-sm"
      arrow={false}
      prefix={<div className={cn('flex items-center justify-center w-full h-full')}><div className={cn('flex items-center justify-center w-[34px] h-[34px] rounded-full bg-gray-100')}><Icon name={item.category.icon} className={cn('text-lg')} /></div></div>}
      onClick={onClick}
    >
      <div>
        <div className={cn('flex justify-between')}>
          <div className={cn('flex')}>
            {/* <div className={cn('mr-1')}>up</div> */}
            <div className={cn('mr-2')}>{item.category.name}</div>
            <div>
              {item.percentage}
              %
            </div>
          </div>
          <div>{isAmountHidden ? '••••' : item.amount}</div>
        </div>
        <div className={cn('mb-2')}>
          <ProgressBar percent={percent} />
        </div>
      </div>
    </List.Item>
  );
};
