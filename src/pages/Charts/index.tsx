import { FC } from 'react';
import { TabBar } from '@/components';

export const Charts: FC = () => {
  return (
    <div className={'page'}>
      <div className={'flex flex-grow'}>图表</div>
      <TabBar active={1} />
    </div>
  );
};
