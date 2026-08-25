import type { EChartsOption } from 'echarts';
import type { FC, ReactNode } from 'react';
import type { MonthBillCategorySegment } from '../model/monthBillDetail';
import type { MonthBillDetailResponse } from '@/entities/record';
import { useCallback, useMemo } from 'react';
import whaleLogo from '@/assets/brand/whale-logo-surface.png';
import { CategoryIcon } from '@/entities/category';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel } from '@/shared/ui';
import { MONTH_BILL_CHART_COLORS, toMonthBillDetailModel } from '../model/monthBillDetail';
import { MonthBillChart } from './MonthBillChart';

interface RendererProps {
  data: MonthBillDetailResponse;
  mode: 'screen' | 'export';
  onChartReady?: (sessionId: number, chartKey: string) => void;
  onChartError?: (sessionId: number, chartKey: string, error: Error) => void;
  exportSessionId?: number;
  chartsEnabled?: boolean;
  qrCode?: string;
}

export const MonthBillDetailRenderer: FC<RendererProps> = ({ chartsEnabled = true, data, exportSessionId, mode, onChartError, onChartReady, qrCode }) => {
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
    <div className={isExport ? 'w-[375px] bg-[linear-gradient(154.699deg,#e2f6ff_6.9%,#f4fbff_50%,#fff2f7_93.1%)] px-[18px] pb-6 pt-5' : 'flex min-h-0 flex-col'} data-bill-renderer={mode}>
      {isExport && <ExportMasthead month={data.month} />}
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
    <GradientPanel className={`mb-3 overflow-hidden px-[14px] py-4 ${exportMode ? '!backdrop-blur-none !bg-white' : ''}`} elevation="low" surface="glass">
      <h2 className="mb-3 text-[15px] font-extrabold text-ww-ink">{title}</h2>
      {children}
    </GradientPanel>
  );
}

function SummaryCard({ data, exportMode }: { data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean }) {
  const { t } = useTranslation('bill');
  return (
    <GradientPanel className={`mb-3 px-[18px] py-4 ${exportMode ? 'backdrop-blur-none' : ''}`} elevation="high" surface="aurora">
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
    </GradientPanel>
  );
}

function Metric({ label, tone, value }: { label: string; tone: 'income' | 'expense'; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-ww-soft">{label}</div>
      <div className={`mt-1 font-number text-[18px] font-black ${tone === 'income' ? 'text-[#2a9460]' : 'text-[#c04870]'}`}>{value}</div>
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
        <MonthBillChart chartKey="expense-pie" className="h-[138px] w-[138px] shrink-0" enabled={chartsEnabled} exportMode={exportMode} kind="pie" onError={onChartError} onReady={onChartReady} option={option} />
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
            <span className="font-number text-[12px] font-extrabold text-[#c04870]">
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
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-white/80 bg-[rgba(111,194,220,0.16)] text-primary-deep shadow-ww-xs">
      <CategoryIcon categoryName={categoryName} iconKey={iconKey} size={17} strokeWidth={1.7} />
    </span>
  );
}

function ExpenseTrendCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 4, left: 4, right: 4, top: 10 },
    series: [{
      areaStyle: { color: 'rgba(111,194,220,0.20)' },
      data: data.expense.dailyTrend.map(item => Number(item.amount)),
      itemStyle: { color: '#4aaac4' },
      lineStyle: { color: '#4aaac4', width: 2 },
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      type: 'line',
    }],
    tooltip: { trigger: 'axis', valueFormatter: value => `¥${Number(value).toFixed(2)}` },
    xAxis: { axisLabel: { show: false }, boundaryGap: false, data: data.expense.dailyTrend.map(item => item.date.slice(-2)), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.16)' } }, type: 'value' },
  }), [data.expense.dailyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('expenseTrend')}>
      <div className="mb-2 grid grid-cols-3 gap-2">
        <Stat label={t('highestDailyExpense')} value={data.expense.highestDay ? `¥${data.expense.highestDay.amount}` : '¥0.00'} />
        <Stat label={t('averageDailyExpense')} value={`¥${data.expense.averageDaily}`} />
        <Stat label={t('currentMonthExpense')} value={`¥${data.summary.expense}`} />
      </div>
      <MonthBillChart chartKey="expense-daily" className="h-[140px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="line" onError={onChartError} onReady={onChartReady} option={option} />
    </SectionCard>
  );
}

function ComparisonCard({ chartsEnabled = true, data, exportMode, onChartError, onChartReady }: { chartsEnabled?: boolean; data: ReturnType<typeof toMonthBillDetailModel>; exportMode?: boolean; onChartError?: (key: string, error: Error) => void; onChartReady?: (key: string) => void }) {
  const { t } = useTranslation('bill');
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 28, containLabel: true, left: 2, right: 2, top: 30 },
    series: [{
      barMaxWidth: 18,
      data: data.expense.monthlyTrend.map(item => Number(item.amount)),
      itemStyle: { borderRadius: [5, 5, 0, 0], color: '#6fc2dc' },
      label: { color: '#5c7080', fontSize: 9, lineHeight: 12, position: 'top', show: true, formatter: params => Number(params.value ?? 0) > 0 ? `${(Number(params.value) / 10000).toFixed(1)}万` : '' },
      type: 'bar',
    }],
    xAxis: { axisLabel: { lineHeight: 14 }, axisLine: { show: false }, axisTick: { show: false }, data: data.expense.monthlyTrend.map(item => `${Number(item.month.slice(5))}月`), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.12)' } }, type: 'value' },
  }), [data.expense.monthlyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('monthlyExpenseComparison')}>
      <MonthBillChart chartKey="expense-monthly" className="h-[170px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="bar" onError={onChartError} onReady={onChartReady} option={option} />
      <div className="mt-1 border-t border-border-primary pt-3 text-[11px] font-semibold text-ww-soft">{t('categoryChangeTop', { month: data.month })}</div>
      {data.expense.categoryChanges.length === 0
        ? <div className="py-4 text-center text-[12px] text-ww-soft">{t('noSignificantChange')}</div>
        : data.expense.categoryChanges.map((item, index) => (
            <div className="flex items-center gap-2 py-1.5" key={item.categoryId}>
              <span className="w-4 font-number text-[12px] font-extrabold text-ww-mid">{index + 1}</span>
              <BillCategoryIcon categoryName={item.name} iconKey={item.icon} />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ww-ink">{item.name}</span>
              <span className={item.direction === 'increase' ? 'font-number text-[11px] font-bold text-[#d35b58]' : 'font-number text-[11px] font-bold text-[#2a9460]'}>
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
  const option = useMemo<EChartsOption>(() => ({
    grid: { bottom: 28, containLabel: true, left: 2, right: 2, top: 30 },
    series: [{
      barMaxWidth: 18,
      data: data.income.monthlyTrend.map(item => Number(item.amount)),
      itemStyle: { borderRadius: [5, 5, 0, 0], color: '#6fc2dc' },
      label: { color: '#5c7080', fontSize: 9, lineHeight: 12, position: 'top', show: true, formatter: params => Number(params.value ?? 0) > 0 ? `${(Number(params.value) / 10000).toFixed(1)}万` : '' },
      type: 'bar',
    }],
    xAxis: { axisLabel: { lineHeight: 14 }, axisLine: { show: false }, axisTick: { show: false }, data: data.income.monthlyTrend.map(item => `${Number(item.month.slice(5))}月`), type: 'category' },
    yAxis: { axisLabel: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: 'rgba(110,194,220,0.12)' } }, type: 'value' },
  }), [data.income.monthlyTrend]);
  return (
    <SectionCard exportMode={exportMode} title={t('incomeAnalysis')}>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-ww-soft">{t('totalIncome')}</span>
        <span className="font-number text-[22px] font-black text-[#2a9460]">
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
      <MonthBillChart chartKey="income-monthly" className="h-[170px] w-full" enabled={chartsEnabled} exportMode={exportMode} kind="bar" onError={onChartError} onReady={onChartReady} option={option} />
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

function ExportMasthead({ month }: { month: string }) {
  const { t } = useTranslation('bill');
  return (
    <header className="relative mb-3 overflow-hidden rounded-[22px] border border-[rgba(110,194,220,0.25)] bg-white/65 px-5 py-4 shadow-ww-xs" data-export-masthead>
      <span className="absolute -right-5 -top-8 h-24 w-24 rounded-full border-[10px] border-[#f0a0b8]/25" />
      <span className="absolute bottom-2 right-16 h-2 w-2 rounded-full bg-[#a996dc]" />
      <div className="relative flex items-center gap-3">
        <img alt="" className="h-11 w-11 rounded-[14px] bg-white/85 p-1 object-contain" src={whaleLogo} />
        <div>
          <div className="text-[17px] font-black tracking-[0.02em] text-ww-ink">{config.appName}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ww-mid">{t('exportBrandTagline')}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-number text-[17px] font-black text-ww-ink">{month}</div>
          <div className="text-[10px] font-semibold text-ww-soft">{t('monthOverview')}</div>
        </div>
      </div>
    </header>
  );
}

function ExportFooter({ qrCode }: { qrCode?: string }) {
  const { t } = useTranslation('bill');
  return (
    <footer className="mt-1 flex min-h-[150px] items-center justify-between rounded-[20px] border border-[rgba(110,194,220,0.28)] bg-[linear-gradient(135deg,#c8eaf6_0%,#e2f6ff_55%,#f4e8f8_100%)] px-5 py-5 text-ww-ink shadow-ww-xs" data-export-footer>
      <div className={`flex items-center gap-3 ${qrCode ? '' : 'mx-auto'}`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/85 bg-white/75 p-1 shadow-ww-xs">
          <img alt="" className="h-full w-full rounded-[10px] object-contain" src={whaleLogo} />
        </span>
        <div>
          <div className="text-[17px] font-black">{config.appName}</div>
          <div className="mt-1 text-[11px] font-semibold text-ww-mid">{t('exportBrandTagline')}</div>
        </div>
      </div>
      {qrCode && <img alt={t('exportQrHint')} className="h-[82px] w-[82px] rounded-[10px] border border-white/85 bg-white p-1 shadow-ww-xs" data-export-qr src={qrCode} />}
    </footer>
  );
}
