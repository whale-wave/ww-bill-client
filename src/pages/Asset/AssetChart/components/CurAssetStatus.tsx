import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import type { PieSeriesOption } from 'echarts/charts';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useMount, useUnmount } from 'ahooks';
import { useAssetSummaryInfo } from '@/hooks';
import { formatAmount } from '@/utils';

echarts.use([
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption
>;

export const CurAssetStatus: FC = () => {
  const chartDomRef = useRef<HTMLDivElement>(null);
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  const { addAssetGroupPercent, info } = useAssetSummaryInfo();

  const data = addAssetGroupPercent.map(item => ({
    name: item.group.name,
    value: item.percent,
  }));

  const total = useMemo(() => {
    return data.reduce((acc, cur) => acc + cur.value, 0);
  }, [data]);

  const percentMap = useMemo(() => {
    return data.reduce((acc, cur) => {
      acc[cur.name] = `${((cur.value / total) * 100).toFixed(1)}%`;
      return acc;
    }, {} as Record<string, string>);
  }, [data, total]);

  useMount(() => {
    const myChart = echarts.init(chartDomRef.current!);
    setMyChart(myChart);
  });

  useUnmount(() => {
    myChart?.dispose();
  });

  useEffect(() => {
    const maxLength = Math.max(...data.map(item => item.name.length));
    const option: EChartsOption = {
      title: {
        textAlign: 'center',
        text: '总资产',
        subtext: formatAmount(info.totalAsset),
        top: '36%',
        left: '24%',
        textStyle: {
          fontSize: 11,
          color: '#999',
        },
        subtextStyle: {
          fontSize: 15,
          color: '#333',
        },
      },
      legend: {
        right: '2%',
        top: 'center',
        orient: 'vertical',
        selectedMode: false,
        formatter: (name: string) => {
          return `{name|${name}} {value|${percentMap[name]}}`;
        },
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          rich: {
            name: {
              width: maxLength * 14,
            },
            value: {
              width: 30,
              align: 'right',
            },
          },
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['60%', '90%'],
          right: '50%',
          label: {
            show: false,
          },
          emphasis: {
            disabled: true,
          },
          data,
        },
      ],
    };

    myChart?.setOption(option);
  }, [myChart, data, percentMap, total, info.totalAsset]);

  return (
    <div className="flex flex-col justify-center">
      <div className="text-base py-3">当前资产状况</div>
      <div className="w-full h-[160px]" ref={chartDomRef}></div>
    </div>
  );
};
