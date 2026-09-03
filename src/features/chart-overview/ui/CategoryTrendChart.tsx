import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { CHART_STYLE_FALLBACKS } from '@/shared/config/chart-style-fallbacks';
import { readAppearanceToken, useAppearanceRevision, withAlpha } from '@/shared/lib/appearance-tokens';
import { useChart } from '@/shared/lib/use-chart';

export interface CategoryTrendRecord {
  amount: string | number;
  time: string;
}

export const CategoryTrendChart: FC<{ records: CategoryTrendRecord[] }> = ({ records }) => {
  const { chartDomRef, myChart } = useChart({ preventTouchMove: false });
  useAppearanceRevision();
  const accent = readAppearanceToken('--ww-theme-color-mid', CHART_STYLE_FALLBACKS.primary);
  const points = useMemo(() => {
    const amounts = new Map<string, number>();
    records.forEach((record) => {
      const date = record.time.slice(0, 10);
      amounts.set(date, (amounts.get(date) ?? 0) + Number(record.amount));
    });
    return [...amounts.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [records]);
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
      yAxis: { axisLabel: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: withAlpha(accent, 0.13), type: 'dashed' } }, type: 'value' },
      series: [{
        areaStyle: { color: withAlpha(accent, 0.14) },
        data: points.map(([, amount]) => amount),
        itemStyle: { color: accent },
        lineStyle: { color: accent, width: 2 },
        showSymbol: points.length <= 12,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        type: 'line',
      }],
    };
    myChart?.setOption(lineOption, { notMerge: true });
    myChart?.resize();
  }, [accent, myChart, points]);

  return (
    <div
      className="mt-[18px] h-[94px] w-full"
      data-chart-category-trend
    >
      <div className="h-full w-full touch-pan-y" ref={chartDomRef} />
    </div>
  );
};
