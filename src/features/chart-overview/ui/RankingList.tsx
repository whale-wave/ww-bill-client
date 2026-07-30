import type { FC } from 'react';
import { List } from 'antd-mobile';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useChartOverview } from '../model/chart-overview-context';
import { RankingItem } from './RankingItem';

export const RankingList: FC = () => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const {
    additionalRankingSections = [],
    curTab,
    currentAmountType,
    currentTimeRangeCategory,
    onRankingItemClick,
    rankingInteraction = 'navigate',
    rankingEmptyContent,
    rankingTitle,
  } = useChartOverview();

  const rankingData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.ranking;
  }, [curTab]);

  const handleRankingItemClick = (item: (typeof rankingData)[number]) => {
    if (onRankingItemClick) {
      onRankingItemClick(item);
      return;
    }

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

  const rankingSections = [
    {
      items: rankingData,
      key: 'category',
      title: rankingTitle ?? `${currentAmountType === 'sub' ? t('amountType.expense') : t('amountType.income')}${t('ranking.title')}`,
    },
    ...additionalRankingSections,
  ];

  return rankingSections.map(section => (
    <div className={cn('flex-shrink-0')} key={section.key}>
      <div className={cn('text-base px-3 pb-1 pt-2')}>{section.title}</div>
      <List className="[--border-bottom:0px] [--border-top:0px]">
        {section.items.length === 0 && rankingEmptyContent
          ? (
              <div className="flex min-h-[120px] items-center justify-center px-4 text-center text-sm text-font-gray">
                {rankingEmptyContent}
              </div>
            )
          : section.items.map(item => (
              <RankingItem
                key={item.category.id}
                item={item}
                onClick={rankingInteraction === 'none' ? undefined : () => handleRankingItemClick(item)}
              />
            ))}
      </List>
    </div>
  ));
};
