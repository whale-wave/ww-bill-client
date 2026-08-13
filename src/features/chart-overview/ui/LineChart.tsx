import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { renderToString } from 'react-dom/server';
import { cn } from '@/shared/lib';
import { useChart } from '@/shared/lib/use-chart';
import { useChartOverview } from '../model/chart-overview-context';
import { TooltipContent } from './TooltipContent';

export const LineChart: FC = () => {
  const { chartDomRef, myChart } = useChart();
  const { currentAmountType, curTab } = useChartOverview();

  const seriesData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.data.map(item => ({
      value: Number(item.amount),
      source: item,
    }));
  }, [curTab]);

  const xAxisData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.data.map(item => item.displayLabel ?? format(item.value, 'MM-dd'));
  }, [curTab]);

  useEffect(() => {
    const option: EChartsOption = {
      grid: {
        top: 8,
        left: 5,
        right: 5,
        bottom: 4,
      },
      tooltip: {
        triggerOn: 'mousemove|click',
        appendToBody: true,
        trigger: 'axis',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: [
          'background: transparent !important',
          'border: 0 !important',
          'border-radius: 18px !important',
          'box-shadow: none !important',
          'padding: 0 !important',
        ].join(';'),
        textStyle: {
          color: '#263340',
        },
        enterable: true,
        position: (point: any, _params: any, dom: any) => {
          const [x, y] = point;
          const { width, height } = dom.getBoundingClientRect();
          const halfWidth = width / 2;
          const viewportPadding = 12;
          const newX = x - halfWidth;
          const newY = y - height - 20;

          if (x + halfWidth > window.innerWidth - viewportPadding) {
            return [window.innerWidth - width - viewportPadding, Math.max(viewportPadding, newY)];
          }
          if (newX < viewportPadding) {
            return [viewportPadding, Math.max(viewportPadding, newY)];
          }
          return [newX, Math.max(viewportPadding, newY)];
        },
        formatter: (_params: any) => {
          const { data } = _params[0];
          const html = renderToString(<TooltipContent data={data.source} currentAmountType={currentAmountType} />);
          return html;
        },
      },
      xAxis: {
        boundaryGap: false,
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: {
          lineStyle: {
            opacity: 0,
          },
        },
        axisLabel: { show: false },
        // axisLabel: {
        //   customValues: ['1月', '3月', '6月', '9月', '12月'],
        // },
      },
      yAxis: {
        type: 'value',
        axisLabel: { show: false },
        splitLine: { lineStyle: { color: 'rgba(110,194,220,0.13)', type: 'dashed' } },
        show: true,
      },
      series: [
        {
          data: seriesData,
          type: 'line',
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: (params) => {
              const data = params.data as { value: number };
              return data.value === 0 ? '#fff' : '#4aaac4';
            },
            borderColor: '#4aaac4',
            borderWidth: 2,
          },
          lineStyle: {
            color: '#4aaac4',
            width: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(111,194,220,0.35)' },
                { offset: 1, color: 'rgba(111,194,220,0.02)' },
              ],
            },
          },
        },
      ],
    };

    myChart?.setOption(option);
  }, [seriesData, xAxisData, myChart, currentAmountType]);

  return (
    <div className={cn('mt-[18px] h-[94px] w-[315px] max-w-full')} ref={chartDomRef} />
  );
};
