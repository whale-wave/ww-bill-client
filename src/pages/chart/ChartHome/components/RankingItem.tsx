import type { FC } from 'react';
import type { GetChartApiResponseRankingData } from '@/entities/chart';
import { List } from 'antd-mobile';
import { useMemo } from 'react';
import { Icon } from '@/components';
import { ProgressBar } from '@/pages/asset/AssetChart/components';
import { cn } from '@/shared/lib';
import styles from './RankingItem.module.scss';

export const RankingItem: FC<{ item: GetChartApiResponseRankingData; onClick: () => void }> = ({ item, onClick }) => {
  const percent = useMemo(() => {
    return Number(item.percentage) / 100;
  }, [item.percentage]);

  return (
    <List.Item
      className={cn(styles['ranking-item'], 'text-sm')}
      arrow={false}
      prefix={<div className={cn('flex items-center justify-center w-full h-full')}><div className={cn('flex items-center justify-center w-[34px] h-[34px] rounded-full bg-gray-100')}><Icon name={item.category.icon} className={cn('text-[18px]')} /></div></div>}
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
          <div>{item.amount}</div>
        </div>
        <div className={cn('mb-2')}>
          <ProgressBar percent={percent} />
        </div>
      </div>
    </List.Item>
  );
};
