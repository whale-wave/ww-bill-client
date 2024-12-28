import { List } from 'antd-mobile';
import type { FC } from 'react';
import styles from './RankingItem.module.scss';
import { Icon } from '@/components';
import { ProgressBar } from '@/pages/Asset/AssetChart/components';
import { cn } from '@/utils';

export const RankingItem: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <List.Item
      className={cn(styles['ranking-item'], 'text-sm')}
      arrow={false}
      prefix={<div className={cn('flex items-center justify-center w-full h-full')}><div className={cn('flex items-center justify-center w-[34px] h-[34px] rounded-full bg-gray-100')}><Icon name="share" className={cn('text-[18px]')} /></div></div>}
      onClick={onClick}
    >
      <div>
        <div className={cn('flex justify-between')}>
          <div className={cn('flex')}>
            <div className={cn('mr-1')}>up</div>
            <div className={cn('mr-2')}>张三</div>
            <div>85.7%</div>
          </div>
          <div>488534</div>
        </div>
        <div className={cn('mb-2')}>
          <ProgressBar percent={0.8} />
        </div>
      </div>
    </List.Item>
  );
};
