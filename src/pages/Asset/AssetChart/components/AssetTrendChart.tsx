import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import type { GridComponentOption, MarkLineComponentOption } from 'echarts/components';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import type { LineSeriesOption } from 'echarts/charts';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useMount, useUnmount } from 'ahooks';
import { Icon } from '@/components';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, TooltipComponent, MarkLineComponent]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | MarkLineComponentOption
>;

export const AssetTrendChart: FC = () => {
  const chartDomRef = useRef<HTMLDivElement>(null);
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  const xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const seriesData = [300, 200, 250, 300, 0, 200, 300, 200, 250, 300, 250, 200];
  const maxValue = Math.max(...seriesData);

  const handleSelectYear = useCallback(() => {
    console.info('select year');
  }, []);

  useMount(() => {
    const myChart = echarts.init(chartDomRef.current!);
    setMyChart(myChart);
  });

  useUnmount(() => {
    myChart?.dispose();
  });

  useEffect(() => {
    const option: EChartsOption = {
      grid: {
        top: '10%',
        left: '3%',
        right: '3%',
        bottom: '17%',
      },
      tooltip: {
        triggerOn: 'mousemove',
        trigger: 'axis',
        backgroundColor: '#333', // 浅黑色背景
        borderWidth: 0,
        textStyle: {
          color: '#fff', // 白色文字
        },
        formatter: (params: any) => {
          const data = params[0].data;
          return `${data}`;
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

  useEffect(() => {
    if (!myChart)
      return;

    const chartDom = chartDomRef.current!;

    const handleTouchEnd = () => {
      myChart.dispatchAction({
        type: 'updateAxisPointer',
        currTrigger: 'leave',
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    chartDom.addEventListener('touchmove', handleTouchMove, { passive: false });
    chartDom.addEventListener('touchend', handleTouchEnd);
    chartDom.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      chartDom.removeEventListener('touchmove', handleTouchMove);
      chartDom.removeEventListener('touchend', handleTouchEnd);
      chartDom.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [myChart]);

  return (
    <div className="flex flex-col border-[1px] border-solid border-gray-200 rounded-lg shadow-md p-3">
      <div className="flex justify-between items-center h-[30px]">
        <div className="text-base">资产走势图</div>
        <div className="bg-gray-100 flex justify-center items-center rounded-md py-1 px-2 space-x-1" onClick={handleSelectYear}>
          <div className="text-xs">2024年</div>
          <Icon className="text-[8px]" name="show-bottom" />
        </div>
      </div>
      <div className="h-[120px]" ref={chartDomRef} />
    </div>
  );
};
