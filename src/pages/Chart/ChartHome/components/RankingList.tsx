import type { FC } from 'react';
import { List } from 'antd-mobile';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { useChartStore } from '@/store';
import { RankingItem } from './RankingItem';

export const RankingList: FC = () => {
  const navigate = useNavigate();
  const curTab = useChartStore(state => state.curTab);
  const currentAmountType = useChartStore(state => state.currentAmountType);
  const currentTimeRangeCategory = useChartStore(state => state.currentTimeRangeCategory);

  const rankingData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.ranking;
  }, [curTab]);

  const onRankingItemClick = (item: (typeof rankingData)[number]) => {
    const searchParams = new URLSearchParams({
      categoryId: String(item.category.id),
      type: currentAmountType,
      category: currentTimeRangeCategory,
    });

    if (curTab?.key)
      searchParams.set('tabKey', curTab.key);

    navigate(`/chart/category?${searchParams.toString()}`, {
      state: {
        rankingItem: item,
        tabKey: curTab?.key,
        tabName: curTab?.name,
        amountType: currentAmountType,
        timeRangeCategory: currentTimeRangeCategory,
        curTab,
      },
    });
  };

  return (
    <div className={cn('flex-shrink-0')}>
      <div className={cn('text-base px-3 pb-1 pt-2')}>
        {currentAmountType === 'sub' ? '支出' : '收入'}
        排行榜
      </div>
      <List
        style={{ '--border-top': '0px', '--border-bottom': '0px' }}
      >
        {
          rankingData.map(item => (
            <RankingItem
              key={item.category.id}
              item={item}
              onClick={() => onRankingItemClick(item)}
            />
          ))
        }
      </List>
    </div>
  );
};
