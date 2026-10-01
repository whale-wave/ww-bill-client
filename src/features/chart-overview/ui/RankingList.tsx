import type { FC, ReactNode } from 'react';
import { RankingSectionVisual } from '@ww-bill/bill-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { useChartOverview } from '../model/chart-overview-context';
import { RankingItem } from './RankingItem';

export const RankingList: FC<{ betweenSections?: ReactNode }> = ({ betweenSections }) => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const {
    additionalRankingSections = [],
    curTab,
    currentAmountType,
    currentTimeRangeCategory,
    customRange,
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
    if (curTab?.anchorDate)
      searchParams.set('anchorDate', curTab.anchorDate);
    if (currentTimeRangeCategory === 'custom' && customRange) {
      searchParams.set('startDate', customRange.startDate);
      searchParams.set('endDate', customRange.endDate);
    }

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

  const categorySection = {
    items: rankingData,
    key: 'category',
    title: rankingTitle ?? `${currentAmountType === 'sub' ? t('amountType.expense') : t('amountType.income')}${t('ranking.title')}`,
  };
  const renderSection = (section: typeof categorySection) => (
    <RankingSectionVisual key={section.key} title={section.title}>
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
              onClick={rankingInteraction === 'none' || section.key !== 'category' ? undefined : () => handleRankingItemClick(item)}
            />
          ))}
    </RankingSectionVisual>
  );

  return (
    <>
      {renderSection(categorySection)}
      {betweenSections}
      {additionalRankingSections.map(renderSection)}
    </>
  );
};
