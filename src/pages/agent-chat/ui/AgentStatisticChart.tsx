import type { AgentStatisticCard } from '@/entities/agent';
import { useEffect } from 'react';
import { readAppearanceChartColors, readAppearanceToken } from '@/shared/lib/appearance-tokens';
import { useChart } from '@/shared/lib/use-chart';

export function AgentStatisticChart({ card }: { card: AgentStatisticCard }) {
  const { chartDomRef, myChart } = useChart({ preventTouchMove: false });

  useEffect(() => {
    if (!myChart || card.chartType === 'metric')
      return;
    const colors = readAppearanceChartColors();
    const textColor = readAppearanceToken('--ww-text-color-soft', '#667085');
    const values = card.points.map(point => Number(point.amount));
    const labels = card.points.map(point => point.label);
    const option = card.chartType === 'donut'
      ? {
          color: colors,
          series: [{
            data: card.points.map(point => ({ name: point.label, value: Number(point.amount) })),
            label: { color: textColor, formatter: '{b}\n¥{c}' },
            radius: ['48%', '74%'],
            type: 'pie',
          }],
          tooltip: { trigger: 'item', valueFormatter: (value: number) => `¥${value.toFixed(2)}` },
        }
      : {
          color: colors,
          grid: { bottom: 28, left: 8, right: 8, top: 18, containLabel: true },
          series: [{
            data: values,
            smooth: card.chartType === 'line',
            type: card.chartType,
          }],
          tooltip: { trigger: 'axis', valueFormatter: (value: number) => `¥${value.toFixed(2)}` },
          xAxis: { axisLabel: { color: textColor }, data: labels, type: 'category' },
          yAxis: { axisLabel: { color: textColor }, splitLine: { lineStyle: { opacity: 0.12 } }, type: 'value' },
        };
    myChart.setOption(option, true);
  }, [card, myChart]);

  if (card.chartType === 'metric')
    return null;

  return <div aria-label="统计图表" className="mt-3 h-[220px] w-full" ref={chartDomRef} role="img" />;
}
