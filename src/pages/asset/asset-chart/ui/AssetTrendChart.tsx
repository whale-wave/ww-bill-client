import type { Dayjs } from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, MarkLineComponentOption } from 'echarts/components';
import type { FC } from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AssetStatisticalRecordType, useAssetStatisticalRecord, useGetAssetStatisticalRecordQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { useChart } from '@/shared/lib/use-chart';
import { Icon } from '@/shared/ui';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, TooltipComponent, MarkLineComponent]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | MarkLineComponentOption
>;

export const AssetTrendChart: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  const { t } = useTranslation('asset');
  let chartTitle = t('chart.assetTrend');
  switch (type) {
    case AssetStatisticalRecordType.LIABILITY:
      chartTitle = t('chart.liabilityTrend');
      break;
    case AssetStatisticalRecordType.NET_ASSET:
      chartTitle = t('chart.netAssetTrend');
      break;
    default:
      break;
  }

  const [selectYear, setSelectYear] = useState<Dayjs>(() => dayjs());
  const range = useMemo(() => {
    return {
      startTime: selectYear.startOf('year').valueOf(),
      endTime: selectYear.endOf('year').valueOf(),
    };
  }, [selectYear]);
  const { data } = useGetAssetStatisticalRecordQuery({ params: { ...range, type } });
  const { groupByMonth } = useAssetStatisticalRecord(data);
  const xAxisData = groupByMonth.map(i => `${i.month}${t('chart.monthSuffix')}`);
  const seriesData = groupByMonth.map(i => Number(i.amount));
  const maxValue = Math.max(...seriesData);
  const { chartDomRef, myChart } = useChart();

  const handleSelectYear = useCallback(async () => {
    const result = await DatePicker.prompt({
      defaultValue: selectYear.toDate(),
      precision: 'year',
    });
    if (result)
      setSelectYear(dayjs(result));
  }, [selectYear]);

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
          customValues: [
            `1${t('chart.monthSuffix')}`,
            `3${t('chart.monthSuffix')}`,
            `6${t('chart.monthSuffix')}`,
            `9${t('chart.monthSuffix')}`,
            `12${t('chart.monthSuffix')}`,
          ],
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
  }, [seriesData, xAxisData, myChart, maxValue, t]);

  return (
    <div className="flex flex-col border-[1px] border-solid border-gray-200 rounded-lg shadow-md p-3">
      <div className="flex justify-between items-center h-[30px]">
        <div className="text-base">{chartTitle}</div>
        <div className="bg-gray-100 flex justify-center items-center rounded-md py-1 px-2 space-x-1" onClick={handleSelectYear}>
          <div className="text-xs">
            {selectYear.format('YYYY')}
            {t('chart.yearSuffix')}
          </div>
          <Icon className="text-xs" name="show-bottom" />
        </div>
      </div>
      <div className="h-[120px]" ref={chartDomRef} />
    </div>
  );
};
