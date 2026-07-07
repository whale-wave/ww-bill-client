import type { PieSeriesOption } from 'echarts/charts';
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import type { FC } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { PieChart } from 'echarts/charts';
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AssetStatisticalRecordType, useAssetSummaryInfo } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';

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

export const CurAssetStatus: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  const { t } = useTranslation('asset');
  const chartDomRef = useRef<HTMLDivElement>(null);
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  const { addAssetGroupPercent, subAssetGroupPercent, info } = useAssetSummaryInfo();

  const groupPercent = useMemo(() => {
    if (type === AssetStatisticalRecordType.ASSET)
      return addAssetGroupPercent;
    return subAssetGroupPercent;
  }, [type, addAssetGroupPercent, subAssetGroupPercent]);

  const data = groupPercent.map(item => ({
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
    const MIN_WIDTH = 40;
    const width = maxLength * 14;
    const option: EChartsOption = {
      title: {
        textAlign: 'center',
        text: type === AssetStatisticalRecordType.ASSET ? t('chart.totalAsset') : t('chart.totalLiability'),
        subtext: type === AssetStatisticalRecordType.ASSET ? formatAmount(info.addAsset) : formatAmount(info.subAsset),
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
              width: width < MIN_WIDTH ? MIN_WIDTH : width,
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
  }, [myChart, data, percentMap, total, info.totalAsset, t]);

  return (
    <div className="flex flex-col justify-center">
      <div className="text-base py-3">{type === AssetStatisticalRecordType.ASSET ? t('chart.currentAssetStatus') : t('chart.currentLiabilityStatus')}</div>
      <div className="w-full h-[160px]" ref={chartDomRef}></div>
    </div>
  );
};
