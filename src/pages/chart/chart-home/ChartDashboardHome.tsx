import type { FC } from 'react';
import type { ChartDashboardParams, ChartDashboardPeriod, ChartDashboardResult, PersonalAssetDashboardResult } from '@/entities/chart';
import { useQuery } from '@tanstack/react-query';
import { addDays, addMonths, addYears, format, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAssetQuery } from '@/entities/asset';
import { getChartDashboardApi, getHouseholdChartDashboardApi, getLedgerChartDashboardApi, getPersonalAssetDashboardApi } from '@/entities/chart';
import { useHouseholdRecordFilterOptionsQuery } from '@/entities/household';
import { LedgerCapability, useGetLedgersQuery } from '@/entities/ledger';
import { useRecordFilterOptionsQuery } from '@/entities/record';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { assertSuccessApi } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { Surface } from '@/shared/ui';
import { buildAssetTrendGeometry, buildTrendGeometry, formatChartPercent, getLatestAssetValue } from './model/dashboard-chart';

type Scope = { kind: 'personal' } | { kind: 'ledger'; ledgerId: string } | { kind: 'household'; householdId: string };
type Metric = 'expense' | 'income' | 'net';

function localDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}
function parseDate(value: string | null, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return new Date(`${fallback}T12:00:00`);
  return new Date(`${value}T12:00:00`);
}
function legacyTabDate(value: string | null, period: ChartDashboardPeriod) {
  if (!value)
    return undefined;
  if (period === 'year' && /^\d{4}$/.test(value))
    return `${value}-01-01`;
  const match = value.match(/^(\d{4})-W?(\d{1,2})$/);
  if (!match)
    return undefined;
  const year = Number(match[1]);
  const part = Number(match[2]);
  if (period === 'month' && part >= 1 && part <= 12)
    return `${year}-${String(part).padStart(2, '0')}-01`;
  if (period === 'week' && part >= 1 && part <= 53)
    return localDate(startOfISOWeek(setISOWeek(setISOWeekYear(new Date(year, 0, 4), year), part)));
  return undefined;
}
function periodBounds(period: ChartDashboardPeriod, anchor: Date) {
  if (period === 'week') {
    const start = startOfISOWeek(anchor);
    return [localDate(start), localDate(addDays(start, 6))];
  }
  if (period === 'year')
    return [`${format(anchor, 'yyyy')}-01-01`, `${format(anchor, 'yyyy')}-12-31`];
  return [`${format(anchor, 'yyyy-MM')}-01`, localDate(addDays(addMonths(new Date(anchor.getFullYear(), anchor.getMonth(), 1), 1), -1))];
}

const money = (value: string, hidden: boolean) => hidden ? '••••' : `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function categoryDonutGradient(categories: NonNullable<ChartDashboardResult['categories']>) {
  const colors = ['#48a8dc', '#56bb9b', '#f1ba62', '#8f88d8', '#e58d7d'];
  const visible = categories.slice(0, 5);
  const total = categories.reduce((sum, item) => sum + Number(item.amount), 0);
  if (!visible.length)
    return 'conic-gradient(#e9eef1 0 100%)';
  let accumulated = 0;
  const slices = visible.map((item, index) => {
    const start = accumulated / Math.max(total, 0.01) * 100;
    accumulated += Number(item.amount);
    const end = accumulated / Math.max(total, 0.01) * 100;
    return `${colors[index]} ${start}% ${end}%`;
  });
  slices.push(`#aeb9c3 ${accumulated / Math.max(total, 0.01) * 100}% 100%`);
  return `conic-gradient(${slices.join(', ')})`;
}

export const ChartDashboardHome: FC<{ scope: Scope; defaultPeriod?: ChartDashboardPeriod; hideAmounts?: boolean }> = ({ scope, defaultPeriod, hideAmounts = false }) => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const [draftTagMatch, setDraftTagMatch] = useState<'any' | 'all'>('any');
  const [draftAccount, setDraftAccount] = useState('');
  const [draftSourceMemberId, setDraftSourceMemberId] = useState('');
  const [assetMetric, setAssetMetric] = useState<'netAsset' | 'asset' | 'liability'>('netAsset');
  const today = localDate();
  const earliestCustomDate = localDate(addYears(parseDate(today, today), -3));
  const period = (['week', 'month', 'year', 'all', 'custom'].includes(params.get('range') ?? '')
    ? params.get('range') as ChartDashboardPeriod
    : defaultPeriod ?? (scope.kind === 'personal' ? 'week' : 'month'));
  const legacyDate = legacyTabDate(params.get('tab'), period);
  const anchor = parseDate(params.get('date') ?? legacyDate ?? null, today);
  const [periodStart, periodEnd] = period === 'custom'
    ? [(params.get('startDate') ?? today).slice(0, 10), (params.get('endDate') ?? today).slice(0, 10)]
    : periodBounds(period === 'all' ? 'year' : period, anchor);
  const metricParam = params.get('metric');
  const legacyDisplay = params.get('display');
  const legacyAmount = params.get('amount');
  const normalizedMetric = metricParam?.toLowerCase();
  const metric: Metric = normalizedMetric === 'net'
    ? 'net'
    : ['income', 'add'].includes(normalizedMetric ?? '') || legacyAmount === 'add'
        ? 'income'
        : 'expense';
  const tagIds = (params.get('tagIds') ?? '').split(',').filter(Boolean);
  const queryParams: ChartDashboardParams = {
    period,
    ...(period === 'custom' ? { startDate: `${periodStart}T00:00:00+08:00`, endDate: `${periodEnd}T23:59:59+08:00` } : period !== 'all' ? { anchorDate: localDate(anchor) } : {}),
    ...(tagIds.length ? { tagIds, tagMatch: params.get('tagMatch') === 'all' ? 'all' : 'any' } : {}),
    ...(params.get('account') ? { account: params.get('account')! } : {}),
    ...(params.get('sourceMemberId') ? { sourceMemberId: Number(params.get('sourceMemberId')) } : {}),
  };
  const query = useQuery({
    queryKey: ['chart-dashboard', scope, queryParams],
    queryFn: async () => {
      const response = scope.kind === 'personal'
        ? await getChartDashboardApi(queryParams)
        : scope.kind === 'ledger'
          ? await getLedgerChartDashboardApi(scope.ledgerId, queryParams)
          : await getHouseholdChartDashboardApi(scope.householdId, queryParams);
      return assertSuccessApi(response).data as ChartDashboardResult;
    },
    staleTime: 30_000,
  });
  const assetParams = {
    period,
    ...(period === 'custom' ? { startDate: `${periodStart}T00:00:00+08:00`, endDate: `${periodEnd}T23:59:59+08:00` } : period !== 'all' ? { anchorDate: localDate(anchor) } : {}),
  } satisfies ChartDashboardParams;
  const assetQuery = useQuery({
    queryKey: ['personal-asset-chart-dashboard', assetParams],
    queryFn: async () => assertSuccessApi(await getPersonalAssetDashboardApi(assetParams)).data as PersonalAssetDashboardResult,
    enabled: scope.kind === 'personal',
    staleTime: 30_000,
  });
  const assetOptions = useGetAssetQuery({ options: { enabled: scope.kind !== 'ledger' } });
  const recordFilterOptions = useRecordFilterOptionsQuery({
    params: scope.kind === 'ledger' ? { ledgerId: scope.ledgerId } : undefined,
    queryOptions: { enabled: scope.kind !== 'household' },
  });
  const householdFilterOptions = useHouseholdRecordFilterOptionsQuery({
    params: { householdId: scope.kind === 'household' ? scope.householdId : '' },
    queryOptions: { enabled: scope.kind === 'household' },
  });
  const ledgerOptions = useGetLedgersQuery({ queryOptions: { enabled: scope.kind === 'personal' } });
  const userQuery = useGetUserUserInfoQuery({ options: { enabled: scope.kind === 'household' } });
  const availableTags = scope.kind === 'household' ? householdFilterOptions.data.tags : recordFilterOptions.data.tags;
  const canReadTags = scope.kind === 'household' ? householdFilterOptions.data.capabilities.tag : recordFilterOptions.data.capabilities.tag;
  const data = query.data;
  const chartValues = useMemo(() => data?.timeline.map(point => Number(point[metric])) ?? [], [data, metric]);
  const chartAverage = chartValues.length ? chartValues.reduce((sum, value) => sum + value, 0) / chartValues.length : 0;
  const trend = useMemo(() => buildTrendGeometry(chartValues), [chartValues]);
  const selectedCategories = metric === 'income' ? data?.incomeCategories ?? [] : data?.categories ?? [];
  const gradient = categoryDonutGradient(selectedCategories);
  const assetGeometry = assetQuery.data ? buildAssetTrendGeometry(assetQuery.data.timeline, assetMetric) : undefined;
  const latestAssetValue = assetQuery.data ? getLatestAssetValue(assetQuery.data.timeline, assetMetric) : null;

  const setValue = (key: string, value?: string) => setParams((previous) => {
    if (value)
      previous.set(key, value);
    else
      previous.delete(key);
    previous.delete('tab');
    return previous;
  }, { replace: true });
  const openFilter = () => {
    setDraftTagIds(tagIds);
    setDraftTagMatch(params.get('tagMatch') === 'all' ? 'all' : 'any');
    setDraftAccount(params.get('account') ?? '');
    setDraftSourceMemberId(params.get('sourceMemberId') ?? '');
    setFilterOpen(true);
  };
  const toggleDraftTag = (tagId: string) => {
    setDraftTagIds(current => current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId]);
  };
  useEffect(() => {
    const shouldSetDate = period !== 'all' && period !== 'custom' && !params.get('date');
    const shouldSetRange = !params.get('range');
    const shouldSetCustomRange = period === 'custom' && (!params.get('startDate') || !params.get('endDate'));
    const shouldSetMetric = !params.get('metric');
    if (shouldSetDate || shouldSetRange || shouldSetCustomRange || shouldSetMetric) {
      setParams((previous) => {
        if (shouldSetDate)
          previous.set('date', legacyDate ?? today);
        if (shouldSetRange)
          previous.set('range', period);
        if (shouldSetCustomRange) {
          if (!previous.get('startDate'))
            previous.set('startDate', today);
          if (!previous.get('endDate'))
            previous.set('endDate', today);
        }
        if (shouldSetMetric)
          previous.set('metric', metric);
        previous.delete('tab');
        return previous;
      }, { replace: true });
    }
  }, [legacyDate, metric, params, period, setParams, today]);
  useEffect(() => {
    if (legacyDisplay !== 'line' && legacyDisplay !== 'pie')
      return;
    const target = document.querySelector<HTMLElement>(`[data-dashboard-section="${legacyDisplay === 'pie' ? 'categories' : 'trend'}"]`);
    const scrollContainer = target?.closest<HTMLElement>('[data-dashboard-scroll]');
    if (target && scrollContainer)
      scrollContainer.scrollTop = Math.max(0, target.offsetTop - scrollContainer.offsetTop - 12);
  }, [data, legacyDisplay]);
  const stepPeriod = (direction: -1 | 1) => {
    const moved = period === 'week' ? addDays(anchor, direction * 7) : period === 'year' ? addYears(anchor, direction) : addMonths(anchor, direction);
    if (localDate(moved) > today)
      return;
    setValue('date', localDate(moved));
  };
  const applyFilterDraft = () => {
    setParams((previous) => {
      if (draftTagIds.length)
        previous.set('tagIds', draftTagIds.join(','));
      else
        previous.delete('tagIds');
      if (draftTagIds.length)
        previous.set('tagMatch', draftTagMatch);
      else
        previous.delete('tagMatch');
      if (draftAccount && scope.kind !== 'ledger')
        previous.set('account', draftAccount);
      else
        previous.delete('account');
      if (draftSourceMemberId && scope.kind === 'household')
        previous.set('sourceMemberId', draftSourceMemberId);
      else
        previous.delete('sourceMemberId');
      previous.delete('tab');
      return previous;
    }, { replace: true });
    setFilterOpen(false);
  };
  const [rangeStart, rangeEnd] = data ? [data.startDate, data.endDate] : [periodStart, periodEnd];
  const categoryRoute = (item: NonNullable<ChartDashboardResult['categories']>[number]) => {
    if (!data)
      return;
    const type: 'add' | 'sub' = metric === 'income' ? 'add' : 'sub';
    const category = { id: item.id ?? item.key ?? '', name: item.name, icon: item.icon ?? 'bill', iconType: item.iconType ?? 'BUILTIN', textIconEnabled: item.textIconEnabled, textIconIndex: item.textIconIndex };
    const state = {
      amount: item.amount,
      category,
      endDate: data.endDate,
      percentage: String(Math.round((item.percent ?? 0) * 1000) / 10),
      periodName: `${data.startDate} — ${data.endDate}`,
      startDate: data.startDate,
      type,
      tagIds,
      tagMatch: params.get('tagMatch') ?? 'any',
      account: params.get('account') ?? undefined,
      sourceMemberId: params.get('sourceMemberId') ? Number(params.get('sourceMemberId')) : undefined,
    };
    if (scope.kind === 'ledger') {
      const search = makeCategoryDetailSearch(state);
      navigate(`${ROUTES_PATH.LEDGER_CHART_CATEGORY.getPath(scope.ledgerId)}?${search}`, { state });
    }
    else if (scope.kind === 'household') {
      const search = makeCategoryDetailSearch(state);
      navigate(`${ROUTES_PATH.HOUSEHOLD_CHART_CATEGORY.getPath(scope.householdId)}?${search}`, { state });
    }
    else {
      const search = new URLSearchParams({
        anchorDate: period === 'custom' || period === 'all' ? data.startDate : localDate(anchor),
        category: period,
        categoryId: String(item.id),
        categoryName: item.name,
        categoryIcon: item.icon ?? 'bill',
        categoryIconType: item.iconType ?? 'BUILTIN',
        amount: item.amount,
        percentage: String(Math.round((item.percent ?? 0) * 1000) / 10),
        periodName: `${data.startDate} — ${data.endDate}`,
        type,
        tabKey: period === 'custom' ? `${data.startDate}:${data.endDate}` : params.get('tab') ?? '',
      });
      if (period === 'custom' || period === 'all') {
        search.set('startDate', data.startDate);
        search.set('endDate', data.endDate);
      }
      if (tagIds.length)
        search.set('tagIds', tagIds.join(','));
      if (params.get('tagMatch'))
        search.set('tagMatch', params.get('tagMatch')!);
      if (params.get('account'))
        search.set('account', params.get('account')!);
      navigate(`/chart/category?${search.toString()}`);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas text-ww-ink" data-chart-dashboard>
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-[max(10px,var(--ww-safe-area-top))]">
        <h1 className="text-[22px] font-extrabold">{t('dashboard.title')}</h1>
        <button aria-label={t('dashboard.filter')} className="grid size-10 place-items-center rounded-full bg-white shadow-ww-xs" onClick={openFilter} type="button"><SlidersHorizontal size={18} /></button>
      </header>
      <div className="mx-4 grid shrink-0 grid-cols-5 rounded-full bg-[#e9eef1] p-1 text-center text-[13px]">
        {(['week', 'month', 'year', 'all', 'custom'] as const).map(item => (
          <button
            key={item}
            aria-pressed={period === item}
            onClick={() => {
              setParams((previous) => {
                previous.set('range', item);
                previous.delete('tab');
                if (item === 'custom') {
                  if (!previous.get('startDate'))
                    previous.set('startDate', today);
                  if (!previous.get('endDate'))
                    previous.set('endDate', today);
                  previous.delete('date');
                }
                else {
                  previous.set('date', today);
                  previous.delete('startDate');
                  previous.delete('endDate');
                }
                return previous;
              }, { replace: true });
            }}
            className={`rounded-full py-2 ${period === item ? 'bg-white font-bold text-primary-deep shadow-ww-xs' : 'text-ww-soft'}`}
            type="button"
          >
            {item === 'all' ? t('dashboard.all') : item === 'custom' ? t('dashboard.range') : t(`tabs.${item}`)}
          </button>
        ))}
      </div>
      {period === 'custom'
        ? (
            <div className="flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-sm">
              <input
                aria-label={t('dashboard.start')}
                className="rounded-xl bg-white px-2 py-2"
                max={periodEnd}
                min={earliestCustomDate}
                onChange={(event) => {
                  if (event.target.value <= periodEnd)
                    setValue('startDate', event.target.value);
                }}
                type="date"
                value={periodStart}
              />
              <span>{t('dashboard.from')}</span>
              <input
                aria-label={t('dashboard.end')}
                className="rounded-xl bg-white px-2 py-2"
                max={today}
                min={periodStart}
                onChange={(event) => {
                  if (event.target.value >= periodStart && event.target.value <= today)
                    setValue('endDate', event.target.value);
                }}
                type="date"
                value={periodEnd}
              />
            </div>
          )
        : (
            <div className="flex shrink-0 items-center justify-between px-5 py-3">
              {period !== 'all' && <button aria-label={t('dashboard.previous')} className="grid size-10 place-items-center rounded-full bg-primary text-white" onClick={() => stepPeriod(-1)} type="button"><ChevronLeft size={20} /></button>}
              <span className="text-[15px] font-semibold text-ww-mid">{period === 'all' ? `${data?.startDate ?? '—'} ${t('dashboard.from')} ${data?.endDate ?? today}` : `${rangeStart}  —  ${rangeEnd}`}</span>
              {period !== 'all' && <button aria-label={t('dashboard.next')} className="grid size-10 place-items-center rounded-full bg-primary text-white disabled:opacity-40" disabled={periodEnd >= today} onClick={() => stepPeriod(1)} type="button"><ChevronRight size={20} /></button>}
            </div>
          )}
      <main className="ww-tab-bar-scroll-padding min-h-0 flex-1 space-y-3 overflow-y-auto px-4" data-dashboard-scroll>
        {query.isError && <button className="w-full rounded-2xl bg-white p-4 text-sm text-red-600" onClick={() => void query.refetch()} type="button">{t('dashboard.loadError')}</button>}
        {query.isLoading && !data && <div className="h-40 animate-pulse rounded-3xl bg-white" />}
        {data && (
          <>
            <Surface className="p-4" material="content">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">{t('dashboard.summary')}</h2>
                <span className="text-xs text-ww-soft">{t('dashboard.days', { count: data.summary.dayCount })}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[[t('dashboard.expense'), data.summary.expense, 'text-ww-ink'], [t('dashboard.income'), data.summary.income, 'text-primary-deep'], [t('dashboard.net'), data.summary.net, 'text-ww-ink'], [t('dashboard.dailyAverage'), data.summary.averageDailyExpense, 'text-ww-mid']].map(([label, amount, color]) => (
                  <div key={label} className="rounded-2xl bg-[#f6f8f9] p-3">
                    <div className="text-xs text-ww-soft">{label}</div>
                    <div className={`mt-1 font-number text-lg font-semibold ${color}`}>{money(amount, hideAmounts)}</div>
                  </div>
                ))}
              </div>
            </Surface>
            <Surface className="p-4" data-dashboard-section="trend" material="content">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">{t('dashboard.trend')}</h2>
                <div className="flex rounded-full bg-[#f1f3f4] p-1">{(['expense', 'income', 'net'] as Metric[]).map(item => <button key={item} className={`rounded-full px-3 py-1 text-xs ${metric === item ? 'bg-white font-bold text-primary-deep shadow-ww-xs' : 'text-ww-soft'}`} onClick={() => setValue('metric', item)} type="button">{t(`dashboard.${item}`)}</button>)}</div>
              </div>
              <div className="h-28 border-b border-dashed border-[#dfe5e8] px-1">
                <div className="relative h-full w-full">
                  <svg aria-label={t('dashboard.trend')} className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <line x1="0" x2="100" y1={trend.zeroY} y2={trend.zeroY} stroke="#e3e9ec" strokeDasharray="2 3" strokeWidth="0.7" />
                    <line x1="0" x2="100" y1="8" y2="8" stroke="#edf0f2" strokeDasharray="2 3" strokeWidth="0.7" />
                    <line x1="0" x2="100" y1="92" y2="92" stroke="#edf0f2" strokeDasharray="2 3" strokeWidth="0.7" />
                    {trend.path && (
                      <>
                        <path d={`${trend.path} L 100 ${trend.zeroY} L 0 ${trend.zeroY} Z`} fill={metric === 'income' ? 'rgba(86,187,155,.14)' : 'rgba(72,168,220,.14)'} />
                        <path d={trend.path} fill="none" stroke={metric === 'income' ? '#56bb9b' : metric === 'net' ? '#8f88d8' : '#48a8dc'} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                  {trend.points.map((point, index) => (
                    <span
                      aria-label={`${data.timeline[index].label ?? data.timeline[index].key} ${money(String(chartValues[index]), hideAmounts)}`}
                      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
                      key={data.timeline[index].key}
                      role="img"
                      style={{ backgroundColor: metric === 'income' ? '#56bb9b' : metric === 'net' ? '#8f88d8' : '#48a8dc', left: `${point.x}%`, top: `${point.y}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-ww-soft">
                <span>{data.timeline[0]?.label ?? data.timeline[0]?.key}</span>
                <span>
                  {t('dashboard.averageBy', { unit: t(`dashboard.unit${data.grain[0].toUpperCase()}${data.grain.slice(1)}`) })}
                  :
                  {' '}
                  {money(String(chartAverage), hideAmounts)}
                </span>
                <span>{data.timeline.at(-1)?.label ?? data.timeline.at(-1)?.key}</span>
              </div>
            </Surface>
            <Surface className="p-4" data-dashboard-section="categories" material="content">
              <h2 className="mb-4 font-bold">{t('dashboard.categories')}</h2>
              <div className="flex items-center gap-4">
                <div aria-label={t('dashboard.categories')} className="relative size-32 shrink-0 rounded-full" style={{ background: gradient }}>
                  <div className="absolute inset-5 grid place-content-center rounded-full bg-white text-center">
                    <span className="text-[10px] text-ww-soft">{t(metric === 'income' ? 'dashboard.totalIncome' : 'dashboard.totalExpense')}</span>
                    <span className="font-number text-sm font-bold">{money(metric === 'income' ? data.summary.income : data.summary.expense, hideAmounts)}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {selectedCategories.map((item, index) => (
                    <button className="flex w-full items-center gap-2 text-left text-xs" key={`${item.id ?? item.key}-${item.name}`} onClick={() => categoryRoute(item)} type="button">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: ['#48a8dc', '#56bb9b', '#f1ba62', '#8f88d8', '#e58d7d'][index % 5] }} />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="font-number">{money(item.amount, hideAmounts)}</span>
                      <span className="w-9 text-right text-ww-soft">{formatChartPercent(item.percent ?? 0)}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedCategories.length > 5 && (
                <div className="mt-3 border-t border-border-primary pt-2 text-xs text-ww-soft">
                  {t('dashboard.other')}
                  ：
                  {money(String(selectedCategories.slice(5).reduce((sum, item) => sum + Number(item.amount), 0)), hideAmounts)}
                </div>
              )}
              {selectedCategories.length === 0 && <div className="py-4 text-center text-sm text-ww-soft">{t('dashboard.noCategories')}</div>}
            </Surface>
            <Surface className="p-4" material="content">
              <h2 className="mb-3 font-bold">{t('dashboard.adjustments')}</h2>
              <div className="grid grid-cols-3 gap-2">
                {[[t('dashboard.refund'), data.adjustments.refund], [t('dashboard.cashback'), data.adjustments.cashback], [t('dashboard.supplement'), data.adjustments.supplement]].map(([label, amount]) => (
                  <div key={label} className="rounded-xl bg-[#f6f8f9] p-3">
                    <div className="text-xs text-ww-soft">{label}</div>
                    <div className="mt-1 font-number text-sm">{money(amount, hideAmounts)}</div>
                  </div>
                ))}
              </div>
            </Surface>
            {scope.kind === 'personal' && assetQuery.data && (
              <>
                <Surface className="p-4" material="content">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold">{t('dashboard.assets')}</h2>
                      <p className="mt-1 text-[11px] text-ww-soft">{`${assetQuery.data.startDate} — ${assetQuery.data.endDate}`}</p>
                    </div>
                    <div className="flex rounded-full bg-[#f1f3f4] p-1">{(['netAsset', 'asset', 'liability'] as const).map(item => <button key={item} onClick={() => setAssetMetric(item)} className={`rounded-full px-2.5 py-1 text-[11px] ${assetMetric === item ? 'bg-white font-bold text-primary-deep' : 'text-ww-soft'}`} type="button">{t(`dashboard.${item === 'asset' ? 'totalAsset' : item === 'liability' ? 'liability' : 'netAsset'}`)}</button>)}</div>
                  </div>
                  {latestAssetValue !== null
                    ? (
                        <div className="relative h-24 w-full border-b border-dashed border-[#dfe5e8]">
                          <svg aria-label={t('dashboard.assets')} className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <line stroke="#dfe5e8" strokeDasharray="2 3" strokeWidth="0.8" x1="0" x2="100" y1={assetGeometry?.zeroY ?? 92} y2={assetGeometry?.zeroY ?? 92} />
                            {assetGeometry?.paths.map(path => <path d={path} fill="none" key={path} stroke="#65add3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />)}
                          </svg>
                          {assetGeometry?.points.map(point => point && (
                            <span
                              aria-label={`${point.date}: ${money(point.value, hideAmounts)}`}
                              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[#65add3]"
                              key={point.date}
                              role="img"
                              style={{ left: `${point.x}%`, top: `${point.y}%` }}
                            />
                          ))}
                        </div>
                      )
                    : <div className="grid h-24 place-items-center text-sm text-ww-soft">{t('dashboard.noAssetHistory')}</div>}
                  {latestAssetValue !== null && <p className="mt-2 text-right font-number text-sm font-semibold">{money(latestAssetValue, hideAmounts)}</p>}
                </Surface>
                <Surface className="p-4" material="content">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold">{t('dashboard.transfers')}</h2>
                    <span className="text-sm text-ww-soft">
                      {t('dashboard.transferCount')}
                      :
                      {' '}
                      {assetQuery.data.transfers.count}
                    </span>
                  </div>
                  <div className="mt-2 font-number text-xl font-semibold">{money(assetQuery.data.transfers.amount, hideAmounts)}</div>
                </Surface>
              </>
            )}
            {scope.kind === 'household' && data.members && (
              <Surface className="p-4" material="content">
                <h2 className="mb-3 font-bold">{t('dashboard.members')}</h2>
                {data.members.map(member => (
                  <div className="flex justify-between py-2 text-sm" key={member.user.id}>
                    <span>{member.user.name || member.user.username || '—'}</span>
                    <span>{money(member.amount, hideAmounts)}</span>
                  </div>
                ))}
              </Surface>
            )}
            <Surface className="p-4" material="content">
              <h2 className="mb-3 font-bold">{t('dashboard.tagRanking')}</h2>
              {data.tags === null
                ? <p className="text-sm text-ww-soft">{t('dashboard.noTagPermission')}</p>
                : data.tags?.length
                  ? data.tags.map(tag => (
                      <div className="flex items-center gap-2 py-2 text-sm" key={tag.key}>
                        <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                        <span className="font-number">{money(tag.amount, hideAmounts)}</span>
                        <span className="w-10 text-right text-xs text-ww-soft">{formatChartPercent(tag.percent)}</span>
                      </div>
                    ))
                  : <p className="py-2 text-sm text-ww-soft">{t('dashboard.noTags')}</p>}
            </Surface>
          </>
        )}
      </main>
      {filterOpen && typeof document !== 'undefined' && createPortal((
        <div className="fixed inset-0 z-[110] flex items-end bg-black/30" data-chart-filter-overlay data-tab-swipe-ignore onClick={() => setFilterOpen(false)}>
          <section aria-label={t('dashboard.filter')} className="max-h-[82vh] w-full overflow-y-auto rounded-t-[28px] bg-[#f5f6f7] p-5 pb-[max(24px,env(safe-area-inset-bottom))]" onClick={event => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <button onClick={() => setFilterOpen(false)} type="button">{t('dashboard.close')}</button>
              <h2 className="font-bold">{t('dashboard.filter')}</h2>
              <span />
            </div>
            {scope.kind === 'personal' && (
              <section className="mb-5 rounded-2xl bg-white p-4">
                <h3 className="mb-2 text-sm font-bold">{t('dashboard.books')}</h3>
                <select
                  className="w-full rounded-xl bg-[#f6f8f9] p-3"
                  onChange={(event) => {
                    const nextLedger = ledgerOptions.data.find(item => item.id === event.target.value);
                    if (nextLedger)
                      navigate(ROUTES_PATH.LEDGER_CHARTS.getPath(nextLedger.id));
                  }}
                  value=""
                >
                  <option value="">{t('dashboard.currentBook')}</option>
                  {ledgerOptions.data.filter(item => item.templateKey !== 'system-default' && item.status === 'ACTIVE' && item.capabilities.includes(LedgerCapability.CHART_READ)).map(book => <option key={book.id} value={book.id}>{book.name}</option>)}
                </select>
              </section>
            )}
            {scope.kind === 'household' && (
              <section className="mb-5 rounded-2xl bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold">{t('dashboard.books')}</h3>
                  <button className="text-xs text-primary-deep" onClick={() => setDraftSourceMemberId('')} type="button">{t('dashboard.reset')}</button>
                </div>
                <select
                  className="w-full rounded-xl bg-[#f6f8f9] p-3"
                  onChange={(event) => {
                    setDraftSourceMemberId(event.target.value);
                    if (event.target.value && Number(event.target.value) !== userQuery.data?.id)
                      setDraftAccount('');
                  }}
                  value={draftSourceMemberId}
                >
                  <option value="">{t('dashboard.all')}</option>
                  {householdFilterOptions.data.members.map(member => <option key={member.id} value={member.user.id}>{member.nickname || member.user.name || member.user.username || member.user.id}</option>)}
                </select>
              </section>
            )}
            <section className="mb-5 rounded-2xl bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold">{t('dashboard.tags')}</h3>
                <button
                  className="text-xs text-primary-deep"
                  onClick={() => {
                    setDraftTagIds([]);
                    setDraftTagMatch('any');
                  }}
                  type="button"
                >
                  {t('dashboard.reset')}
                </button>
              </div>
              {canReadTags
                ? (
                    <>
                      <div className="mb-3 flex gap-2">{(['any', 'all'] as const).map(item => <button className={`rounded-full px-3 py-2 text-xs ${draftTagMatch === item ? 'bg-primary text-white' : 'bg-[#f2f4f5]'}`} key={item} onClick={() => setDraftTagMatch(item)} type="button">{t(item === 'any' ? 'dashboard.tagAny' : 'dashboard.tagAll')}</button>)}</div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.filter(tag => tag.status === 'ACTIVE').map((tag) => {
                          const checked = draftTagIds.includes(tag.id);
                          return (
                            <button aria-pressed={checked} className={`rounded-full px-3 py-2 text-xs ${checked ? 'bg-primary-light font-bold text-primary-deep' : 'bg-[#f6f8f9] text-ww-mid'}`} key={tag.id} onClick={() => toggleDraftTag(tag.id)} type="button">
                              {tag.name}
                            </button>
                          );
                        })}
                        {availableTags.length === 0 && <span className="text-xs text-ww-soft">—</span>}
                      </div>
                    </>
                  )
                : <p className="text-xs text-ww-soft">{t('dashboard.noTagPermission')}</p>}
            </section>
            <section className="mb-6 rounded-2xl bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold">{t('dashboard.account')}</h3>
                <button className="text-xs text-primary-deep" onClick={() => setDraftAccount('')} type="button">{t('dashboard.reset')}</button>
              </div>
              {scope.kind === 'ledger'
                ? <p className="text-xs text-ww-soft">{t('dashboard.customAccountHint')}</p>
                : (
                    <select className="w-full rounded-xl bg-[#f6f8f9] p-3" onChange={event => setDraftAccount(event.target.value)} value={draftAccount}>
                      <option value="">{t('dashboard.all')}</option>
                      <option value="unlinked">{t('dashboard.unlinked')}</option>
                      {assetOptions.data.length > 0 && (
                        <optgroup label={t('dashboard.ownAccounts')}>
                          {assetOptions.data.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                        </optgroup>
                      )}
                    </select>
                  )}
            </section>
            <button className="w-full rounded-full bg-primary py-3 font-bold text-white" onClick={applyFilterDraft} type="button">{t('dashboard.apply')}</button>
          </section>
        </div>
      ), document.body,
      )}
    </div>
  );
};

function makeCategoryDetailSearch(state: {
  amount: string;
  category: { id: string | number; icon: string; iconType: 'BUILTIN' | 'IMAGE'; name: string; textIconEnabled?: boolean; textIconIndex?: number };
  endDate: string;
  percentage: string;
  periodName: string;
  startDate: string;
  type: 'add' | 'sub';
  tagIds: string[];
  tagMatch: string;
  account?: string;
  sourceMemberId?: number;
}) {
  const search = new URLSearchParams({
    categoryId: String(state.category.id),
    categoryName: state.category.name,
    categoryIcon: state.category.icon,
    categoryIconType: state.category.iconType,
    amount: state.amount,
    percentage: state.percentage,
    periodName: state.periodName,
    startDate: state.startDate,
    endDate: state.endDate,
    type: state.type,
    tagMatch: state.tagMatch,
  });
  if (state.tagIds.length)
    search.set('tagIds', state.tagIds.join(','));
  if (state.account)
    search.set('account', state.account);
  if (state.sourceMemberId)
    search.set('sourceMemberId', String(state.sourceMemberId));
  return search.toString();
}
