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
    return curTab.data.map(item => format(item.value, 'MM-dd'));
  }, [curTab]);

  useEffect(() => {
    const option: EChartsOption = {
      grid: {
        top: '12%',
        left: '5%',
        right: '5%',
        bottom: '17%',
      },
      tooltip: {
        triggerOn: 'mousemove',
        appendToBody: true,
        trigger: 'axis',
        backgroundColor: '#333',
        borderWidth: 0,
        textStyle: {
          color: '#fff',
        },
        enterable: true,
        position: (point: any, _params: any, dom: any) => {
          const [x, y] = point;
          const { width, height } = dom.getBoundingClientRect();
          const halfWidth = width / 2;
          const newX = x - halfWidth;
          const newY = y - height - 20;

          if (x + halfWidth > window.innerWidth) {
            return [window.innerWidth - width, newY];
          }
          if (newX < 0) {
            return [0, newY];
          }
          return [newX, newY];
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
        axisLine: {
          lineStyle: {
            opacity: 0.1,
          },
        },
        axisTick: {
          lineStyle: {
            opacity: 0,
          },
        },
        // axisLabel: {
        //   customValues: ['1月', '3月', '6月', '9月', '12月'],
        // },
      },
      yAxis: {
        type: 'value',
        show: false,
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
              return data.value === 0 ? '#fff' : '#aeeeff';
            },
            borderColor: '#33333390',
          },
          lineStyle: {
            color: '#33333390',
            width: 1,
          },
          markLine: {
            silent: true,
            data: [{ type: 'max' }],
            label: {
              show: true,
              position: 'insideEndTop',
            },
            lineStyle: {
              color: '#33333360',
              type: 'solid',
            },
            symbol: ['none', 'none'],
          },
        },
      ],
    };

    myChart?.setOption(option);
  }, [seriesData, xAxisData, myChart, currentAmountType]);

  return (
    <div className={cn('h-[150px]')} ref={chartDomRef} />
  );
};
