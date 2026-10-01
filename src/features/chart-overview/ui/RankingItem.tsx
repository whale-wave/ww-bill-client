import type { FC } from 'react';
import type { ChartOverviewRankingItem } from '../model/chart-overview-context';
import { RankingRowVisual } from '@ww-bill/bill-ui';
import { useMemo } from 'react';
import { CategoryIcon } from '@/entities/category';
import { ProgressBar } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';

export const RankingItem: FC<{ item: ChartOverviewRankingItem; onClick?: () => void }> = ({ item, onClick }) => {
  const { isAmountHidden = false } = useChartOverview();
  const percent = useMemo(() => {
    return Number(item.percentage) / 100;
  }, [item.percentage]);

  return (
    <button className="bill-ranking-host w-full border-0 bg-transparent p-0 text-left" data-chart-ranking-item={item.category.id} onClick={onClick} type="button">
      <RankingRowVisual
        label={item.category.name}
        amount={isAmountHidden ? '••••' : item.amount}
        percentage={item.percentage}
        icon={<CategoryIcon categoryName={item.category.name} iconKey={item.category.icon} iconType={item.category.iconType} textIconEnabled={item.category.textIconEnabled} textIconIndex={item.category.textIconIndex} size={16} />}
        progress={<ProgressBar percent={percent} />}
      />
    </button>
  );
};
