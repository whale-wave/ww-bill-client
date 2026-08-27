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
      title: {
        itemGap: 0,
        left: '50%',
        subtext: `¥${formatAmount(totalAmount)}`,
        subtextStyle: { color: '#263340', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, lineHeight: 20 },
        text: t('categoryAmount'),
        textAlign: 'center',
        textStyle: { color: '#8da2b2', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, lineHeight: 16 },
        top: 'center',
      },
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(displayMode === 'pie' ? pieOption : lineOption, true);
    myChart?.resize();
  }, [displayMode, myChart, piePoints, points, t, totalAmount]);

  return (
    <div
      className={displayMode === 'pie' ? 'mt-2 flex h-[124px] min-w-0 items-center gap-3' : 'mt-[18px] h-[94px] w-full'}
      data-chart-category-trend={displayMode}
    >
      <div
        className={displayMode === 'pie' ? 'h-full min-w-0 flex-1 touch-pan-y' : 'h-full w-full touch-pan-y'}
        ref={chartDomRef}
      />
      {displayMode === 'pie' && (
        <ul aria-label={t('categoryRatio')} className="w-[44%] space-y-2 pr-1 text-[10px] font-semibold leading-4 text-ww-mid">
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
