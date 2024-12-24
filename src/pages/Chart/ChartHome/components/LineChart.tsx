import { type FC, useEffect } from 'react';
import type { EChartsOption } from 'echarts';
import { renderToString } from 'react-dom/server';
import { cn } from '@/utils';
import { useChart } from '@/hooks';
import { TooltipContent } from '@/pages/Chart/ChartHome/components';

export const LineChart: FC = () => {
  const { chartDomRef, myChart } = useChart();
  const seriesData = [100, 200, 300, 400, 500];
  const xAxisData = ['1月', '3月', '6月', '9月', '12月'];
  const maxValue = Math.max(...seriesData);

  useEffect(() => {
    const option: EChartsOption = {
      grid: {
        top: '3%',
        left: '3%',
        right: '5%',
        bottom: '17%',
      },
      tooltip: {
        triggerOn: 'mousemove',
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
          const html = renderToString(<TooltipContent data={data} />);
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
        axisLabel: {
          customValues: ['1月', '3月', '6月', '9月', '12月'],
        },
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
              return params.data === 0 ? '#fff' : '#aeeeff';
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
              show: false,
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
  }, [seriesData, xAxisData, myChart, maxValue]);

  return (
    <div className={cn('h-[120px]')} ref={chartDomRef} />
  );
};
