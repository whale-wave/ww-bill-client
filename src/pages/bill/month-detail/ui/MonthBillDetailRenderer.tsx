import type { EChartsOption } from 'echarts';
import type { FC, ReactNode, SyntheticEvent } from 'react';
import type { AvatarReadyState, ExportCopySnapshot, ExportUserSnapshot, MonthBillCategorySegment } from '../model/monthBillDetail';
import type { MonthBillDetailResponse } from '@/entities/record';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CategoryIcon } from '@/entities/category';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { readAppearanceChartColors, readAppearanceToken, useAppearanceRevision, withAlpha } from '@/shared/lib/appearance-tokens';
import { BrandAvatar, Surface } from '@/shared/ui';
import { getAvatarInitial, getMonthBillRingSegments, MONTH_BILL_CHART_COLORS, toMonthBillDetailModel } from '../model/monthBillDetail';
import { MonthBillChart } from './MonthBillChart';

interface RendererProps {
  data: MonthBillDetailResponse;
  mode: 'screen' | 'export';
  onChartReady?: (sessionId: number, chartKey: string) => void;
  onChartError?: (sessionId: number, chartKey: string, error: Error) => void;
  exportSessionId?: number;
  exportUser?: ExportUserSnapshot;
  exportCopy?: ExportCopySnapshot;
  onAvatarReady?: (sessionId: number, state: AvatarReadyState) => void;
  chartsEnabled?: boolean;
  qrCode?: string;
}

export const MonthBillDetailRenderer: FC<RendererProps> = ({ chartsEnabled = true, data, exportCopy, exportSessionId, exportUser, mode, onAvatarReady, onChartError, onChartReady, qrCode }) => {
  const { t } = useTranslation('bill');
  const otherLabel = t('other');
  const model = useMemo(() => toMonthBillDetailModel(data, otherLabel), [data, otherLabel]);
  const handleChartError = useCallback((key: string, error: Error) => {
    if (exportSessionId !== undefined)
      onChartError?.(exportSessionId, key, error);
  }, [exportSessionId, onChartError]);
  const handleChartReady = useCallback((key: string) => {
    if (exportSessionId !== undefined)
      onChartReady?.(exportSessionId, key);
  }, [exportSessionId, onChartReady]);
  const isExport = mode === 'export';
  return (
    <div className={isExport ? 'w-[375px] bg-[var(--ww-page-gradient)] px-[18px] pb-6 pt-5' : 'flex min-h-0 flex-col'} data-bill-renderer={mode}>
      {isExport && exportSessionId !== undefined && exportUser && exportCopy && <ExportMasthead categories={model.expense.chartCategories} copy={exportCopy} onAvatarReady={onAvatarReady} sessionId={exportSessionId} user={exportUser} />}
      <SummaryCard data={model} exportMode={isExport} />
      <ExpenseCategoryCard chartsEnabled={chartsEnabled} data={model} exportMode={isExport} onChartError={handleChartError} onChartReady={handleChartReady} />
      <ExpenseTrendCard chartsEnabled={chartsEnabled} data={model} exportMode={isExport} onChartError={handleChartError} onChartReady={handleChartReady} />
      <ComparisonCard chartsEnabled={chartsEnabled} data={model} exportMode={isExport} onChartError={handleChartError} onChartReady={handleChartReady} />
      <IncomeCard chartsEnabled={chartsEnabled} data={model} exportMode={isExport} onChartError={handleChartError} onChartReady={handleChartReady} />
      <AchievementCard data={model} exportMode={isExport} />
      {isExport && <ExportFooter qrCode={qrCode} />}
    </div>
  );
};

function SectionCard({ children, exportMode, title }: { children: ReactNode; exportMode?: boolean; title: string }) {
  return (
    <Surface className="mb-3 overflow-hidden px-[14px] py-4" data-export-mode={exportMode ? 'export' : undefined} material="content">
      <h2 className="mb-3 text-[15px] font-extrabold text-ww-ink">{title}</h2>
      {children}
    </Surface>
  );
}

function SummaryCard({ data, exportMode }: { data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean }) {
  const { t } = useTranslation('bill');
  return (
    <Surface className="mb-3 px-[18px] py-4" data-export-mode={exportMode ? 'export' : undefined} material="raised">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-white/55 px-3 py-1 font-number text-[13px] font-extrabold text-ww-ink">{data.month}</span>
        <span className="text-[11px] font-semibold text-ww-mid">{t('monthOverview')}</span>
      </div>
      <div className="mb-4 text-[11px] font-semibold text-ww-mid">{t('monthlyBalance')}</div>
      <div className="mb-4 flex items-baseline font-number text-ww-ink">
        <span className="mr-1 text-[16px] font-extrabold text-ww-mid">¥</span>
        <span className="text-[31px] font-black leading-none">{data.summary.balance}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-[rgba(100,160,200,0.18)] pt-3">
        <Metric label={t('income')} tone="income" value={`¥${data.summary.income}`} />
        <Metric label={t('expend')} tone="expense" value={`¥${data.summary.expense}`} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ww-soft">
        <span>{t('recordDays', { count: data.summary.recordDays })}</span>
        <span>{t('recordCount', { count: data.summary.recordCount })}</span>
      </div>
    </Surface>
  );
}

function Metric({ label, tone, value }: { label: string; tone: 'income' | 'expense'; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-ww-soft">{label}</div>
      <div className={`mt-1 font-number text-[18px] font-black ${tone === 'income' ? 'text-finance-income' : 'text-finance-expense'}`}>{value}</div>
    </div>
  );
}

function ExpenseCategoryCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const option = useMemo<EChartsOption>(() => ({
    color: [...MONTH_BILL_CHART_COLORS],
    series: [{
      data: data.expense.chartCategories.map(item => ({ itemStyle: { color: item.color }, name: item.name, value: Number(item.amount) })),
      label: { show: false },
      labelLine: { show: false },
      radius: ['42%', '72%'],
      silent: true,
      type: 'pie',
    }],
    tooltip: { show: false },
  }), [data.expense.chartCategories]);
  return (
    <SectionCard exportMode={exportMode} title={t('expenseCategory')}>
      <div className="flex items-center gap-3">
        <MonthBillChart allowVerticalPageScroll={!exportMode} chartKey="expense-pie" className="h-[138px] w-[138px] shrink-0" enabled={chartsEnabled} exportMode={exportMode} kind="pie" onError={onChartError} onReady={onChartReady} option={option} />
        <div className="min-w-0 flex-1 space-y-2">
          {data.expense.chartCategories.map(item => <CategoryLegend item={item} key={item.key} />)}
        </div>
      </div>
      <div className="mt-3 border-t border-border-primary pt-3">
        <div className="mb-2 text-[11px] font-semibold text-ww-soft">{t('expenseRanking')}</div>
        {data.expense.categories.slice(0, 3).map((item, index) => (
          <div className="flex items-center gap-2 py-1.5" key={item.categoryId}>
            <span className="w-4 font-number text-[12px] font-extrabold text-ww-mid">{index + 1}</span>
            <BillCategoryIcon categoryName={item.name} iconKey={item.icon} />
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ww-ink">{item.name}</span>
            <span className="font-number text-[12px] font-extrabold text-finance-expense">
              -¥
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function CategoryLegend({ item }: { item: MonthBillCategorySegment }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: item.color }} />
      <span className="min-w-0 flex-1 truncate text-ww-mid">{item.name}</span>
      <span className="font-number font-bold text-ww-ink">
        {item.percentage.toFixed(1)}
        %
      </span>
    </div>
  );
}

function BillCategoryIcon({ categoryName, iconKey }: { categoryName: string; iconKey?: string }) {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-border-primary bg-ww-surface-tint text-primary-deep shadow-ww-xs">
      <CategoryIcon categoryName={categoryName} iconKey={iconKey} size={17} strokeWidth={1.7} />
    </span>
  );
}

function useChartAppearanceTokens() {
  const appearanceRevision = useAppearanceRevision();
  return useMemo(() => {
    void appearanceRevision;
    const chartColors = readAppearanceChartColors();
    const primary = readAppearanceToken('--ww-theme-color', chartColors[0]);
    return {
      line: readAppearanceToken('--ww-theme-color-mid', chartColors[0]),
      primary,
      text: readAppearanceToken('--ww-text-color-mid', chartColors[0]),
    };
  }, [appearanceRevision]);
}

function ExpenseTrendCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const chartTokens = useChartAppearanceTokens();
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 4, left: 4, right: 4, top: 10 },
    series: [{
      areaStyle: { color: withAlpha(chartTokens.primary, 0.2) },
      data: data.expense.dailyTrend.map(item => Number(item.amount)),
      itemStyle: { color: chartTokens.line },
      lineStyle: { color: chartTokens.line, width: 2 },
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      type: 'line',
    }],
    tooltip: { trigger: 'axis', valueFormatter: value => `¥${Number(value).toFixed(2)}` },
    xAxis: { axisLabel: { show: false }, boundaryGap: false, data: data.expense.dailyTrend.map(item => item.date.slice(-2)), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.16)' } }, type: 'value' },
  }), [chartTokens, data.expense.dailyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('expenseTrend')}>
      <div className="mb-2 grid grid-cols-3 gap-2">
        <Stat label={t('highestDailyExpense')} value={data.expense.highestDay ? `¥${data.expense.highestDay.amount}` : '¥0.00'} />
        <Stat label={t('averageDailyExpense')} value={`¥${data.expense.averageDaily}`} />
        <Stat label={t('currentMonthExpense')} value={`¥${data.summary.expense}`} />
      </div>
      <MonthBillChart allowVerticalPageScroll={!exportMode} chartKey="expense-daily" className="h-[140px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="line" onError={onChartError} onReady={onChartReady} option={option} />
    </SectionCard>
  );
}

function ComparisonCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const chartTokens = useChartAppearanceTokens();
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 28, containLabel: true, left: 2, right: 2, top: 30 },
    series: [{
      barMaxWidth: 18,
      data: data.expense.monthlyTrend.map(item => Number(item.amount)),
      itemStyle: { borderRadius: [5, 5, 0, 0], color: chartTokens.primary },
      label: { color: chartTokens.text, fontSize: 9, lineHeight: 12, position: 'top', show: true, formatter: params => Number(params.value ?? 0) > 0 ? `${(Number(params.value) / 10000).toFixed(1)}万` : '' },
      type: 'bar',
    }],
    xAxis: { axisLabel: { lineHeight: 14 }, axisLine: { show: false }, axisTick: { show: false }, data: data.expense.monthlyTrend.map(item => `${Number(item.month.slice(5))}月`), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.12)' } }, type: 'value' },
  }), [chartTokens, data.expense.monthlyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('monthlyExpenseComparison')}>
      <MonthBillChart allowVerticalPageScroll={!exportMode} chartKey="expense-monthly" className="h-[170px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="bar" onError={onChartError} onReady={onChartReady} option={option} />
      <div className="mt-1 border-t border-border-primary pt-3 text-[11px] font-semibold text-ww-soft">{t('categoryChangeTop', { month: data.month })}</div>
      {data.expense.categoryChanges.length === 0
        ? <div className="py-4 text-center text-[12px] text-ww-soft">{t('noSignificantChange')}</div>
        : data.expense.categoryChanges.map((item, index) => (
            <div className="flex items-center gap-2 py-1.5" key={item.categoryId}>
              <span className="w-4 font-number text-[12px] font-extrabold text-ww-mid">{index + 1}</span>
              <BillCategoryIcon categoryName={item.name} iconKey={item.icon} />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ww-ink">{item.name}</span>
              <span className={item.direction === 'increase' ? 'font-number text-[11px] font-bold text-finance-expense' : 'font-number text-[11px] font-bold text-finance-income'}>
                {item.direction === 'increase' ? `↑ ${t('increase')}` : `↓ ${t('decrease')}`}
                {' '}
                {item.amount}
              </span>
            </div>
          ))}
    </SectionCard>
  );
}

function IncomeCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const chartTokens = useChartAppearanceTokens();
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 28, containLabel: true, left: 2, right: 2, top: 30 },
    series: [{
      barMaxWidth: 18,
      data: data.income.monthlyTrend.map(item => Number(item.amount)),
      itemStyle: { borderRadius: [5, 5, 0, 0], color: chartTokens.primary },
      label: { color: chartTokens.text, fontSize: 9, lineHeight: 12, position: 'top', show: true, formatter: params => Number(params.value ?? 0) > 0 ? `${(Number(params.value) / 10000).toFixed(1)}万` : '' },
      type: 'bar',
    }],
    xAxis: { axisLabel: { lineHeight: 14 }, axisLine: { show: false }, axisTick: { show: false }, data: data.income.monthlyTrend.map(item => `${Number(item.month.slice(5))}月`), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.12)' } }, type: 'value' },
  }), [chartTokens, data.income.monthlyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('incomeAnalysis')}>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-ww-soft">{t('totalIncome')}</span>
        <span className="font-number text-[22px] font-black text-finance-income">
          ¥
          {data.summary.income}
        </span>
      </div>
      <div className="space-y-2">
        {data.income.chartCategories.map(item => (
          <div className="flex items-center gap-2" key={item.key}>
            <BillCategoryIcon categoryName={item.name} iconKey={item.icon} />
            <span className="w-[76px] truncate text-[11px] font-semibold text-ww-mid">{item.name}</span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-primary-light/50"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.percentage)}%` }} /></div>
            <span className="w-[76px] text-right font-number text-[11px] font-bold text-ww-ink">
              ¥
              {item.amount}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-[11px] font-semibold text-ww-soft">{t('monthlyIncomeComparison')}</div>
      <MonthBillChart allowVerticalPageScroll={!exportMode} chartKey="income-monthly" className="h-[170px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="bar" onError={onChartError} onReady={onChartReady} option={option} />
    </SectionCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="whitespace-nowrap text-[10px] font-semibold leading-[1.35] text-ww-soft">{label}</div>
      <div className="mt-1 min-h-[20px] whitespace-nowrap font-number text-[14px] font-black leading-[1.35] text-ww-ink">{value}</div>
    </div>
  );
}

function AchievementCard({ data, exportMode }: { data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean }) {
  const { t } = useTranslation('bill');
  return (
    <SectionCard exportMode={exportMode} title={t('achievement')}>
      <div className="grid grid-cols-3 divide-x divide-border-primary text-center">
        <AchievementValue label={t('streakDays')} value={`${data.achievement.streakDays}天`} />
        <AchievementValue label={t('totalRecordDays')} value={`${data.achievement.totalRecordDays}天`} />
        <AchievementValue label={t('totalRecordCount')} value={`${data.achievement.totalRecordCount}笔`} />
      </div>
    </SectionCard>
  );
}

function AchievementValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1">
      <div className="min-h-[29px] whitespace-nowrap font-number text-[21px] font-black leading-[1.35] text-ww-ink">{value}</div>
      <div className="mt-1 text-[10px] font-semibold text-ww-soft">{label}</div>
    </div>
  );
}

function ExportMasthead({ categories, copy, onAvatarReady, sessionId, user }: { categories: MonthBillCategorySegment[]; copy: ExportCopySnapshot; onAvatarReady?: (sessionId: number, state: AvatarReadyState) => void; sessionId: number; user: ExportUserSnapshot }) {
  return (
    <header className="relative mb-3 overflow-hidden px-1 py-2" data-export-masthead>
      <span className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full border-[9px] border-ww-pink/20" />
      <span className="pointer-events-none absolute bottom-0 right-20 h-2 w-2 rounded-full bg-primary-mid/70" />
      <div className="relative flex items-center gap-3">
        <ExportAvatar displayName={user.displayName} key={`${sessionId}:${user.avatar ?? 'fallback'}`} onReady={onAvatarReady} sessionId={sessionId} src={user.avatar} />
        <div className="min-w-0">
          <div className="truncate text-[16px] font-black tracking-[0.02em] text-ww-ink">{user.displayName}</div>
          <div className="mt-1 truncate font-number text-[14px] font-black text-ww-ink">{copy.monthTitle}</div>
          <div className="mt-0.5 truncate text-[10px] font-semibold text-ww-mid">{copy.reviewSubtitle}</div>
        </div>
        <ExportCategoryRing categories={categories} />
      </div>
    </header>
  );
}

function ExportAvatar({ displayName, onReady, sessionId, src }: { displayName: string; onReady?: (sessionId: number, state: AvatarReadyState) => void; sessionId: number; src?: string }) {
  const normalizedSrc = src?.trim();
  const [status, setStatus] = useState<'loading' | AvatarReadyState>(normalizedSrc ? 'loading' : 'fallback-ready');
  const onReadyRef = useRef(onReady);
  const loadAttemptRef = useRef(0);
  onReadyRef.current = onReady;

  useLayoutEffect(() => {
    if (status !== 'loading')
      onReadyRef.current?.(sessionId, status);
  }, [sessionId, status]);

  const markFallback = () => {
    loadAttemptRef.current += 1;
    setStatus('fallback-ready');
  };

  const handleLoad = async (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const attempt = loadAttemptRef.current;
    if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      markFallback();
      return;
    }
    try {
      if (typeof image.decode !== 'function')
        throw new Error('Avatar decode is unavailable');
      await image.decode();
      if (attempt !== loadAttemptRef.current)
        return;
      if (image.naturalWidth <= 0 || image.naturalHeight <= 0)
        throw new Error('Avatar decode produced an empty image');
      setStatus('image-ready');
    }
    catch {
      markFallback();
    }
  };

  if (status === 'fallback-ready')
    return <div aria-label={displayName} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-primary-light text-[18px] font-black text-primary-deep shadow-ww-xs" data-export-avatar="fallback-ready">{getAvatarInitial(displayName)}</div>;

  return <img alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-white/90 bg-white/85 object-cover shadow-ww-xs" crossOrigin="anonymous" data-export-avatar={status} onError={markFallback} onLoad={event => void handleLoad(event)} src={normalizedSrc} />;
}

function ExportCategoryRing({ categories }: { categories: MonthBillCategorySegment[] }) {
  const segments = getMonthBillRingSegments(categories);
  let offset = 0;
  return (
    <svg aria-hidden="true" className="ml-auto h-[78px] w-[78px] shrink-0" viewBox="0 0 64 64">
      <circle cx="32" cy="32" fill="none" r="23" stroke="var(--ww-theme-color-light)" strokeWidth="8" />
      {segments.map((segment) => {
        const currentOffset = -offset;
        offset += segment.percentage;
        return <circle cx="32" cy="32" fill="none" key={segment.key} pathLength="100" r="23" stroke={segment.color} strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`} strokeDashoffset={currentOffset} strokeLinecap="butt" strokeWidth="8" transform="rotate(-90 32 32)" />;
      })}
      <circle cx="32" cy="32" fill="var(--ww-card-color)" r="16" />
      <circle cx="32" cy="32" fill="none" r="28" stroke="var(--ww-card-color)" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}

function ExportFooter({ qrCode }: { qrCode?: string }) {
  const { t } = useTranslation('bill');
  return (
    <footer className="mt-1 flex min-h-[150px] items-center justify-between rounded-[20px] border border-border-primary bg-ww-surface px-5 py-5 text-ww-ink shadow-ww-xs" data-export-footer>
      <div className={`flex items-center gap-3 ${qrCode ? '' : 'mx-auto'}`}>
        <BrandAvatar className="h-12 w-12 border border-white/85 bg-white/75 p-1 shadow-ww-xs" imageClassName="object-contain" />
        <div>
          <div className="text-[17px] font-black">{config.appName}</div>
          <div className="mt-1 text-[11px] font-semibold text-ww-mid">{t('exportBrandTagline')}</div>
        </div>
      </div>
      {qrCode && <img alt={t('exportQrHint')} className="h-[82px] w-[82px] rounded-[10px] border border-white/85 bg-white p-1 shadow-ww-xs" data-export-qr src={qrCode} />}
    </footer>
  );
}
