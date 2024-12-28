import { type FC, useMemo } from 'react';
import { List, Toast } from 'antd-mobile';
import { RankingItem } from './RankingItem';
import { cn } from '@/utils';
import { useChartStore } from '@/store';

export const RankingList: FC = () => {
  const curTab = useChartStore(state => state.curTab);

  const rankingData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.ranking;
  }, [curTab]);

  return (
    <div>
      <div className={cn('text-base px-3 pb-1 pt-2')}>支出排行榜</div>
      <List
        style={{ '--border-top': '0px', '--border-bottom': '0px' }}
      >
        {
          rankingData.map(item => (
            <RankingItem
              key={item.category.id}
              item={item}
              onClick={() => {
                Toast.show('敬请期待');
              }}
            />
          ))
        }
      </List>
    </div>
  );
};
