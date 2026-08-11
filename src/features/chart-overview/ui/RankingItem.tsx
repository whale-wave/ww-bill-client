import type { FC } from 'react';
import type { ChartOverviewRankingItem } from '../model/chart-overview-context';
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
    <button
      className="flex h-[56px] w-full items-center gap-[11px] border-0 border-t border-solid border-border-primary bg-transparent py-[10px] text-left first:border-0"
      data-chart-ranking-item={item.category.id}
      onClick={onClick}
      type="button"
    >
      <span className={cn('flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[rgba(111,194,220,0.16)] text-primary-deep')}><Icon name={item.category.icon} className={cn('text-[16px]')} /></span>
      <div className="min-w-0 flex-1">
        <div className={cn('flex items-center justify-between')}>
          <div className="truncate text-[13px] font-semibold leading-[19.5px] text-ww-ink">{item.category.name}</div>
          <div className="ml-2 flex shrink-0 items-center gap-2">
            <div className="font-number text-[10.5px] font-normal leading-[15.75px] text-ww-soft">
              {item.percentage}
              %
            </div>
            <div className="font-number text-[13px] font-bold leading-[19.5px] text-ww-mid">{isAmountHidden ? '••••' : item.amount}</div>
          </div>
        </div>
        <div className={cn('mt-[5px] h-1 overflow-hidden rounded-full bg-black/5')}>
          <ProgressBar percent={percent} />
        </div>
      </div>
    </button>
  );
};
