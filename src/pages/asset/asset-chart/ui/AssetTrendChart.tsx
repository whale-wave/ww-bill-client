import type { Dayjs } from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, MarkLineComponentOption, TooltipComponentOption } from 'echarts/components';
import type { FC } from 'react';
import { DatePicker, SpinLoading } from 'antd-mobile';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { CalendarDays, ChartNoAxesCombined, ChevronDown, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AssetStatisticalRecordType, useAssetStatisticalRecord, useGetAssetStatisticalRecordQuery } from '@/entities/asset';
import { CHART_STYLE_FALLBACKS } from '@/shared/config/chart-style-fallbacks';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedYear } from '@/shared/lib';
import { readAppearanceChartColors, readAppearanceToken, useAppearanceRevision, withAlpha } from '@/shared/lib/appearance-tokens';
import { useChart } from '@/shared/lib/use-chart';
import { Surface } from '@/shared/ui';
import { ChartRetryButton } from './ChartRetryButton';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, TooltipComponent, MarkLineComponent]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | MarkLineComponentOption | TooltipComponentOption
>;

export const AssetTrendChart: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  const appearanceRevision = useAppearanceRevision();
  const { i18n, t } = useTranslation('asset');
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const chartTitle = type === AssetStatisticalRecordType.LIABILITY
    ? t('chart.liabilityTrend')
    : type === AssetStatisticalRecordType.NET_ASSET
      ? t('chart.netAssetTrend')
      : t('chart.assetTrend');
  const [selectYear, setSelectYear] = useState<Dayjs>(() => dayjs());
  const range = useMemo(() => ({
    startTime: selectYear.startOf('year').valueOf(),
    endTime: selectYear.endOf('year').valueOf(),
  }), [selectYear]);
  const { data, isError, isFetching, isLoading, refetch } = useGetAssetStatisticalRecordQuery({ params: { ...range, type } });
  const { groupByMonth } = useAssetStatisticalRecord(data);
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short' }),
    [locale],
  );
  const xAxisData = useMemo(
    () => groupByMonth.map(item => monthFormatter.format(new Date(2024, item.month - 1, 1))),
    [groupByMonth, monthFormatter],
  );
  const seriesData = useMemo(
    () => groupByMonth.map(item => Number(item.amount)),
    [groupByMonth],
  );
  const hasRecords = data.length > 0;
  const isChartReady = !isLoading && !isError && hasRecords;
  const yearLabel = useMemo(
    () => formatLocalizedYear(selectYear.toDate(), locale),
    [locale, selectYear],
  );
  const { chartDomRef, myChart } = useChart();

  const handleSelectYear = useCallback(async () => {
    const result = await DatePicker.prompt({
      className: 'ww-app-date-picker',
      defaultValue: selectYear.toDate(),
      precision: 'year',
      title: chartTitle,
    });
    if (result)
      setSelectYear(dayjs(result));
  }, [chartTitle, selectYear]);

  useEffect(() => {
    if (!myChart)
      return;

    const chartColors = readAppearanceChartColors();
    const line = type === AssetStatisticalRecordType.ASSET
      ? chartColors[0]
      : type === AssetStatisticalRecordType.LIABILITY
        ? chartColors[1]
        : chartColors[2];
    const area = withAlpha(line, 0.22);
    const axisColor = readAppearanceToken('--ww-text-color-soft', CHART_STYLE_FALLBACKS.textSoft);
    const gridColor = withAlpha(line, 0.16);
    const option: EChartsOption = {
      animationDuration: 420,
      grid: {
        bottom: 26,
        containLabel: false,
        left: 8,
        right: 8,
        top: 16,
      },
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: withAlpha(line, 0.32),
            type: 'dashed',
          },
        },
        backgroundColor: CHART_STYLE_FALLBACKS.tooltipBackground,
        borderWidth: 0,
        confine: true,
        textStyle: {
          color: CHART_STYLE_FALLBACKS.inverse,
          fontSize: 11,
        },
        trigger: 'axis',
      },
      xAxis: {
        axisLabel: {
          color: axisColor,
          fontSize: 10,
          interval: (index: number) => [0, 2, 5, 8, 11].includes(index),
          margin: 12,
        },
        axisLine: {
          lineStyle: {
            color: gridColor,
          },
        },
        axisTick: { show: false },
        boundaryGap: false,
        data: xAxisData,
        type: 'category',
      },
      yAxis: {
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: withAlpha(line, 0.1),
            type: 'dashed',
          },
        },
        type: 'value',
      },
      series: [{
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { color: area, offset: 0 },
            { color: CHART_STYLE_FALLBACKS.transparentSurface, offset: 1 },
          ]),
        },
        data: seriesData,
        emphasis: {
          itemStyle: {
            borderColor: CHART_STYLE_FALLBACKS.inverse,
            borderWidth: 3,
            color: line,
          },
          scale: 1.25,
        },
        itemStyle: {
          borderColor: CHART_STYLE_FALLBACKS.inverse,
          borderWidth: 2,
          color: line,
        },
        lineStyle: {
          color: line,
          shadowBlur: 7,
          shadowColor: area,
          width: 2.5,
        },
        name: chartTitle,
        showSymbol: true,
        smooth: 0.36,
        symbol: 'circle',
        symbolSize: 6,
        type: 'line',
      }],
    };

    myChart.setOption(option, true);
  }, [appearanceRevision, chartTitle, myChart, seriesData, type, xAxisData]);

  useEffect(() => {
    if (!myChart || !isChartReady)
      return;
    const frame = requestAnimationFrame(() => myChart.resize());
    return () => cancelAnimationFrame(frame);
  }, [isChartReady, myChart]);

  return (
    <Surface as="article" className="overflow-hidden px-[18px] pb-4 pt-[18px]" material="raised">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/75 bg-white/65 text-primary-deep shadow-ww-xs">
            <ChartNoAxesCombined size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-extrabold text-ww-ink">{chartTitle}</h2>
            <p className="mt-0.5 text-[10px] font-semibold text-ww-soft">{t('manager.overview')}</p>
          </div>
        </div>
        <button
          aria-label={`${chartTitle} ${yearLabel}`}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] border border-solid border-white/80 bg-white/70 px-2.5 font-number text-[11px] font-extrabold text-ww-mid shadow-ww-xs backdrop-blur-xl active:bg-white"
          onClick={handleSelectYear}
          type="button"
        >
          <CalendarDays className="text-primary-deep" size={14} />
          <span>{yearLabel}</span>
          <ChevronDown className="text-ww-soft" size={13} />
        </button>
      </header>

      <div className="relative mt-3 h-[176px]">
        <div
          aria-hidden={!isChartReady}
          className={isChartReady ? 'absolute inset-0 opacity-100 transition-opacity' : 'absolute inset-0 opacity-0'}
          ref={chartDomRef}
        />
        {!isChartReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[16px] border border-white/60 bg-white/35 text-center">
            {isLoading
              ? <SpinLoading color="primary" />
              : isError
                ? (
                    <>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-feedback-danger shadow-ww-xs">
                        <TriangleAlert size={20} />
                      </span>
                      <p className="mt-3 text-[12px] font-bold text-ww-mid">{t('manager.loadError')}</p>
                      <ChartRetryButton isLoading={isFetching} onRetry={() => void refetch()} />
                    </>
                  )
                : (
                    <>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-primary-deep shadow-ww-xs">
                        <ChartNoAxesCombined size={20} />
                      </span>
                      <p className="mt-3 text-[12px] font-bold text-ww-mid">{t('common:empty')}</p>
                    </>
                  )}
          </div>
        )}
      </div>
    </Surface>
  );
};
