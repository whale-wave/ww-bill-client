import type { EChartsOption } from 'echarts';
import type { TitleOption } from 'echarts/types/dist/shared';
import type { FC } from 'react';
import { memo, useLayoutEffect } from 'react';
import { THEME_COLOR } from '@/assets/styles/reset';
import { i18n } from '@/shared/i18n';
import { useChart } from '@/shared/lib/use-chart';

interface RingChartProps {
  percentage?: string;
  isSummaryBudget?: boolean;
}

export const RingChart: FC<RingChartProps> = memo(({ percentage, isSummaryBudget }) => {
  const { chartDomRef, myChart } = useChart();

  useLayoutEffect(() => {
    if (!percentage)
      return;

    const numberPercentage = Number(percentage);
    const percentageValue = Math.min(100, numberPercentage);
    const remainingPercentageValue = Math.max(0, 100 - percentageValue);
    const isOverBudget = numberPercentage < 0;
    const subtext = `${percentageValue.toFixed(0)}%`;

    const titleConfig: TitleOption = {
      text: i18n.t('budget:ringChart.remaining'),
      textStyle: {
        fontSize: isSummaryBudget ? 12 : 11,
        color: '#666',
        fontWeight: 'normal',
      },
      subtext,
      subtextStyle: {
        fontSize: isSummaryBudget ? 14 : 13,
        color: '#333',
      },
      itemGap: 5,
      top: '27%',
      left: 'center',
    };

    const overBudgetTextConfig: TitleOption = {
      text: i18n.t('budget:ringChart.overBudget'),
      textStyle: {
        fontSize: isSummaryBudget ? 16 : 14,
        color: '#e84149',
      },
      top: 'center',
      left: 'center',
    };

    const option: EChartsOption = {
      title: isOverBudget ? overBudgetTextConfig : titleConfig,
      series: [
        {
          type: 'pie',
          radius: ['78%', '100%'],
          emphasis: {
            disabled: true,
          },
          data: [
            {
              value: percentageValue,
              itemStyle: { color: THEME_COLOR },
            },
            {
              value: remainingPercentageValue,
              itemStyle: { color: '#f5f5f5' },
            },
          ],
        },
      ],
    };

    myChart?.setOption(option);
  }, [myChart, percentage, isSummaryBudget]);

  return (
    <div className="flex justify-start items-center w-[100px] h-[100px]">
      <div ref={chartDomRef} className="w-[79px] h-[79px]"></div>
    </div>
  );
});
