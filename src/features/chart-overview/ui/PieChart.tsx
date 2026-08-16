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
      color: ['#6fc2dc', '#f0a0b8', '#a996dc', '#79c6a8', '#efbc70'],
      series: [{
        data,
        emphasis: { scaleSize: 4 },
        label: { show: false },
        labelLine: { show: false },
        radius: ['36%', '66%'],
        type: 'pie',
      }],
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(option);
  }, [data, myChart]);

  return <div className="mt-2 h-[112px]" ref={chartDomRef} />;
};
