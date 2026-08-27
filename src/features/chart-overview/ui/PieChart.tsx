import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, getDonutAmountSize } from '@/shared/lib';
import { useChart } from '@/shared/lib/use-chart';
import { DonutChart } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';

const COLORS = ['#6fc2dc', '#f0a0b8', '#a996dc', '#79c6a8', '#efbc70'];

export const PieChart: FC = () => {
  const { chartDomRef, myChart } = useChart();
  const { t } = useTranslation('chart');
  const { curTab } = useChartOverview();
  const segments = useMemo(() => {
    const ranking = curTab?.ranking ?? [];
    const visible = ranking.slice(0, 4).map((item, index) => ({
      amount: Number(String(item.amount).replace(/[¥,]/g, '')),
      color: COLORS[index],
      name: item.category.name,
      percentage: item.percentage,
    }));
    if (ranking.length <= 4)
      return visible;
    const other = ranking.slice(4);
    return [...visible, {
      amount: other.reduce((sum, item) => sum + Number(String(item.amount).replace(/[¥,]/g, '')), 0),
      color: COLORS[4],
      name: t('other'),
      percentage: other.reduce((sum, item) => sum + Number(item.percentage), 0).toFixed(1),
    }];
  }, [curTab?.ranking, t]);
  const data = useMemo(() => segments.map(segment => ({
    itemStyle: { color: segment.color },
    name: segment.name,
    value: segment.amount,
  })), [segments]);
  const totalAmountValue = Number(String(curTab?.amount ?? 0).replace(/[¥,]/g, ''));
  const formattedAmount = `¥${formatAmount(Number.isFinite(totalAmountValue) ? totalAmountValue : 0)}`;

  useEffect(() => {
    const option: EChartsOption = {
      color: ['#6fc2dc', '#f0a0b8', '#a996dc', '#79c6a8', '#efbc70'],
      series: [{
        data,
        emphasis: { scaleSize: 4 },
        label: { show: false },
        labelLine: { show: false },
        radius: ['38%', '68%'],
        type: 'pie',
      }],
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(option, { notMerge: true });
  }, [data, formattedAmount, myChart, t]);

  return (
    <DonutChart
      amount={formattedAmount.replace(/^¥/, '')}
      amountSize={getDonutAmountSize(formattedAmount)}
      chart={(
        <div className="h-full w-full" data-chart-overview-pie ref={chartDomRef} />
      )}
      label={t('categoryAmount')}
      legend={(
        <div className="space-y-2" data-chart-overview-pie-legend>
          {segments.map(segment => (
            <div className="flex min-w-0 items-center gap-2 text-[12px] leading-4 text-ww-mid" key={segment.name}>
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="min-w-0 flex-1 truncate">{segment.name}</span>
              <span className="shrink-0 font-number">
                {segment.percentage}
                %
              </span>
            </div>
          ))}
        </div>
      )}
      marker="overview"
    />
  );
};
