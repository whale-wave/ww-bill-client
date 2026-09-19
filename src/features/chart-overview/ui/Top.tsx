import type { FC } from 'react';
import type { ChartOverviewMetricOption } from '../model/chart-overview-context';
import type { TimeRangeCategory } from '@/entities/chart';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DesignIcon } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';
import { formatChartOverviewCustomRangeSummary } from '../model/custom-range';
import { CustomRangeSheet } from './CustomRangeSheet';

export const Top: FC = () => {
  const { t } = useTranslation('chart');
  const [isMetricMenuVisible, setIsMetricMenuVisible] = useState(false);
  const [isCustomRangeVisible, setIsCustomRangeVisible] = useState(false);
  const [customRangeSession, setCustomRangeSession] = useState(0);
  const {
    currentAmountType,
    currentMetric = currentAmountType,
    currentTimeRangeCategory,
    customRange,
    metricOptions,
    onMetricChange,
    onCustomRangeChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
  } = useChartOverview();

  const timeRangeCategoryList = useMemo(() => [
    { name: t('tabs.week'), value: 'week' },
    { name: t('tabs.month'), value: 'month' },
    { name: t('tabs.year'), value: 'year' },
    { name: t('tabs.custom'), value: 'custom' },
  ] as { name: string; value: TimeRangeCategory | 'custom' }[], [t]);

  const amountTypeList = useMemo<ChartOverviewMetricOption[]>(() => metricOptions ?? [
    { label: t('amount.expend'), icon: 'huankuanzhichu-copy', value: 'sub' },
    { label: t('amount.income'), icon: 'jiekuanshouru-copy', value: 'add' },
  ], [metricOptions, t]);
  const selectedMetric = amountTypeList.find(item => item.value === currentMetric) ?? amountTypeList[0];

  const handleClickAmountType = useCallback((metric: ChartOverviewMetricOption['value']) => () => {
    if (onMetricChange)
      onMetricChange(metric);
    else if (metric !== 'net')
      setCurrentAmountType(metric);
    setIsMetricMenuVisible(false);
  }, [onMetricChange, setCurrentAmountType]);
  const openCustomRange = useCallback(() => {
    setCustomRangeSession(session => session + 1);
    setIsCustomRangeVisible(true);
  }, []);

  return (
    <header className="shrink-0 pt-[max(8px,env(safe-area-inset-top))]">
      <div className="relative flex h-[52px] items-start justify-between gap-3 px-[22px] pb-4 pt-0.5">
        <h1 className="text-[18px] font-extrabold leading-[27px] text-ww-ink">{t('title')}</h1>
        <button
          aria-expanded={isMetricMenuVisible}
          className="flex items-center gap-1.5 rounded-[12px] border border-border-primary bg-white/[0.84] px-[14px] py-[7px] text-[13px] font-bold leading-[19.5px] text-ww-mid shadow-ww-xs"
          data-chart-metric-trigger
          onClick={() => setIsMetricMenuVisible(value => !value)}
          type="button"
        >
          {selectedMetric?.label}
          <DesignIcon name="chart-selector-chevron" size={12} />
        </button>
        <div className={`absolute right-[22px] top-[42px] z-20 min-w-[104px] overflow-hidden rounded-[12px] border border-border-primary bg-white/95 p-1 shadow-ww backdrop-blur-xl ${isMetricMenuVisible ? '' : 'hidden'}`}>
          {amountTypeList.map(item => (
            <button
              className="block w-full rounded-[9px] px-3 py-2 text-left text-[13px] text-ww-mid hover:bg-primary-light/40"
              data-chart-amount-type={item.value}
              key={item.value}
              onClick={handleClickAmountType(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-[18px] pb-3">
        <div className="chart-period-tabs grid grid-cols-4 gap-[3px] rounded-[14px] border border-border-primary bg-white/[0.84] p-1 shadow-ww">
          {timeRangeCategoryList.map(item => (
            <button
              aria-pressed={item.value === currentTimeRangeCategory}
              className={`rounded-[10px] py-2 text-[13px] leading-[19.5px] transition ${
                item.value === currentTimeRangeCategory
                  ? 'ww-theme-primary-action font-bold'
                  : 'font-medium text-ww-soft'
              }`}
              key={item.value}
              onClick={() => item.value === 'custom'
                ? openCustomRange()
                : setCurrentTimeRangeCategory(item.value)}
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>
        {currentTimeRangeCategory === 'custom' && customRange && (
          <button
            className="mt-3 flex w-full items-center justify-between rounded-[14px] border border-border-primary bg-white/[0.84] px-4 py-3 text-left text-[13px] font-bold text-ww-mid shadow-ww-xs"
            onClick={openCustomRange}
            type="button"
          >
            <span>{formatChartOverviewCustomRangeSummary(customRange)}</span>
            <span className="text-primary-deep">修改</span>
          </button>
        )}
      </div>
      <CustomRangeSheet
        key={customRangeSession}
        onApply={(range) => {
          onCustomRangeChange?.(range);
          setIsCustomRangeVisible(false);
        }}
        onClose={() => setIsCustomRangeVisible(false)}
        range={customRange}
        visible={isCustomRangeVisible}
      />
    </header>
  );
};
