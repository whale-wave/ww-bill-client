import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import type { ChartOverviewDisplay } from '../model/chart-overview-context';
import { useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { useChart } from '@/shared/lib/use-chart';

export interface CategoryTrendRecord {
  amount: string | number;
  time: string;
}

const PIE_COLORS = ['#6fc2dc', '#f0a0b8', '#a996dc', '#79c6a8', '#efbc70'];

function getCenterAmountClass(value: number) {
  const length = formatAmount(value).length;
  if (length > 14)
    return 'text-[10px]';
  if (length > 11)
    return 'text-[11px]';
  return 'text-[17px]';
}

function formatCenterAmount(value: number) {
  return `¥${formatAmount(value)}`;
}

export const CategoryTrendChart: FC<{ displayMode: ChartOverviewDisplay; records: CategoryTrendRecord[] }> = ({ displayMode, records }) => {
  const { t } = useTranslation('chart');
  const { chartDomRef, myChart } = useChart({ preventTouchMove: false });
  const points = useMemo(() => {
    const amounts = new Map<string, number>();
    records.forEach((record) => {
      const date = record.time.slice(0, 10);
      amounts.set(date, (amounts.get(date) ?? 0) + Number(record.amount));
    });
    return [...amounts.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [records]);
  const totalAmount = useMemo(
    () => points.reduce((total, [, amount]) => total + amount, 0),
    [points],
  );
  const piePoints = useMemo(() => {
    const ranked = [...points].sort(([, left], [, right]) => right - left);
    if (ranked.length <= 4)
      return ranked;

    const visible = ranked.slice(0, 3);
    const otherAmount = ranked.slice(3).reduce((total, [, amount]) => total + amount, 0);
    return [...visible, [t('other'), otherAmount] as [string, number]];
  }, [points, t]);

  useEffect(() => {
    const lineOption: EChartsOption = {
      grid: { bottom: 8, left: 5, right: 5, top: 8 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        boundaryGap: false,
        data: points.map(([date]) => date),
        type: 'category',
      },
      yAxis: { axisLabel: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(110,194,220,0.13)', type: 'dashed' } }, type: 'value' },
      series: [{
        areaStyle: { color: 'rgba(111,194,220,0.14)' },
        data: points.map(([, amount]) => amount),
        itemStyle: { color: '#4aaac4' },
        lineStyle: { color: '#4aaac4', width: 2 },
        showSymbol: points.length <= 12,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        type: 'line',
      }],
    };
    const pieOption: EChartsOption = {
      color: PIE_COLORS,
      series: [{
        center: ['50%', '50%'],
        data: piePoints.map(([date, amount]) => ({ name: date, value: amount })),
        emphasis: { scale: false },
        label: { show: false },
        labelLine: { show: false },
        radius: ['46%', '74%'],
        type: 'pie',
      }],
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(displayMode === 'pie' ? pieOption : lineOption, true);
    myChart?.resize();
  }, [displayMode, myChart, piePoints, points, t, totalAmount]);

  return (
    <div
      className={displayMode === 'pie' ? 'mt-2 flex h-[140px] min-w-0 items-center gap-4 px-1 py-2' : 'mt-[18px] h-[94px] w-full'}
      data-chart-category-trend={displayMode}
    >
      <div className={displayMode === 'pie' ? 'relative h-[140px] w-[140px] shrink-0' : 'h-full w-full'}>
        <div
          aria-label={displayMode === 'pie' ? `${t('categoryAmount')} ¥${formatAmount(totalAmount)}` : undefined}
          className="h-full w-full touch-pan-y"
          ref={chartDomRef}
        />
        {displayMode === 'pie' && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-white/90 px-1 text-center">
            <span className="text-[11px] leading-4 text-ww-soft">{t('categoryAmount')}</span>
            <strong className={`mt-0.5 max-w-full whitespace-nowrap font-number font-bold leading-6 text-ww-ink ${getCenterAmountClass(totalAmount)}`}>{formatCenterAmount(totalAmount)}</strong>
          </div>
        )}
      </div>
      {displayMode === 'pie' && (
        <ul aria-label={t('categoryRatio')} className="min-w-0 flex-1 space-y-2 text-[12px] font-semibold leading-4 text-ww-soft">
          {piePoints.map(([date, amount], index) => (
            <li className="flex min-w-0 items-center gap-1.5" key={date}>
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: PIE_COLORS[index] }} />
              <span className="min-w-0 flex-1 truncate">{date === t('other') ? date : date.slice(5).replace('-', '.')}</span>
              <span className="shrink-0 font-number text-ww-ink">{totalAmount ? `${((amount / totalAmount) * 100).toFixed(1)}%` : '--'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
