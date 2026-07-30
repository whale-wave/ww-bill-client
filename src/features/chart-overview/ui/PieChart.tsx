import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useChart } from '@/shared/lib/use-chart';
import { useChartOverview } from '../model/chart-overview-context';

export const PieChart: FC = () => {
  const { chartDomRef, myChart } = useChart();
  const { curTab } = useChartOverview();
  const data = useMemo(() => (curTab?.ranking ?? []).map(item => ({
    name: item.category.name,
    value: Number(item.amount),
  })), [curTab?.ranking]);

  useEffect(() => {
    const option: EChartsOption = {
      color: ['#aeeeff', '#89d6e8', '#68bfd4', '#46a8bf', '#2791aa'],
      legend: { bottom: 0, type: 'scroll' },
      series: [{
        data,
        emphasis: { scaleSize: 4 },
        label: { formatter: '{b} {d}%' },
        radius: ['38%', '68%'],
        type: 'pie',
      }],
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(option);
  }, [data, myChart]);

  return <div className="h-[150px]" ref={chartDomRef} />;
};
