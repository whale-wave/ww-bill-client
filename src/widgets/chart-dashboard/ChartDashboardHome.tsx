import type { FC } from 'react';
import type { ChartDashboardMetric, ChartDashboardScope } from './model/useChartDashboardUrlState';
import type { ChartDashboardPeriod, ChartDashboardResult } from '@/entities/chart';
import { addDays, addMonths, addYears } from 'date-fns';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAssetQuery } from '@/entities/asset';
import { CategoryIcon } from '@/entities/category';
import { useHouseholdRecordFilterOptionsQuery } from '@/entities/household';
import { useGetLedgersQuery } from '@/entities/ledger';
import { useRecordFilterOptionsQuery } from '@/entities/record';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { Surface } from '@/shared/ui';
import { buildAssetTrendGeometry, buildTrendGeometry, formatChartPercent, getLatestAssetValue } from './model/dashboard-chart';
import { useChartDashboardQueries } from './model/useChartDashboardQueries';
import { localDate, useChartDashboardUrlState } from './model/useChartDashboardUrlState';
import { ChartDashboardFilterSheet } from './ui/ChartDashboardFilterSheet';

const money = (value: string, hidden: boolean) => hidden ? '••••' : `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function categoryDonutGradient(categories: NonNullable<ChartDashboardResult['categories']>) {
  const colors = Array.from({ length: 5 }, (_, index) => `var(--ww-chart-${index + 1})`);
  const visible = categories.slice(0, 5);
  const total = categories.reduce((sum, item) => sum + Number(item.amount), 0);
  if (!visible.length)
    return 'conic-gradient(var(--ww-border-color) 0 100%)';
  let accumulated = 0;
  const slices = visible.map((item, index) => {
    const start = accumulated / Math.max(total, 0.01) * 100;
    accumulated += Number(item.amount);
    const end = accumulated / Math.max(total, 0.01) * 100;
    return `${colors[index]} ${start}% ${end}%`;
  });
  slices.push(`var(--ww-chart-6) ${accumulated / Math.max(total, 0.01) * 100}% 100%`);
  return `conic-gradient(${slices.join(', ')})`;
}

export const ChartDashboardHome: FC<{ scope: ChartDashboardScope; defaultPeriod?: ChartDashboardPeriod; hideAmounts?: boolean }> = ({ scope, defaultPeriod, hideAmounts = false }) => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const [draftTagMatch, setDraftTagMatch] = useState<'any' | 'all'>('any');
  const [draftAccount, setDraftAccount] = useState('');
  const [draftSourceMemberId, setDraftSourceMemberId] = useState('');
  const [assetMetric, setAssetMetric] = useState<'netAsset' | 'asset' | 'liability'>('netAsset');
  const {
    account,
    anchor,
    assetParams,
    earliestCustomDate,
    legacyDisplay,
    metric,
    params,
    period,
    periodEnd,
    periodStart,
    queryParams,
    setParams,
    setValue,
    tagIds,
    today,
  } = useChartDashboardUrlState(scope, defaultPeriod);
  const { assetQuery, dashboardQuery: query } = useChartDashboardQueries(scope, queryParams, assetParams);
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

  const openFilter = () => {
    setDraftTagIds(tagIds);
    setDraftTagMatch(params.get('tagMatch') === 'all' ? 'all' : 'any');
    setDraftAccount(account ?? '');
    setDraftSourceMemberId(params.get('sourceMemberId') ?? '');
    setFilterOpen(true);
  };
  const toggleDraftTag = (tagId: string) => {
    setDraftTagIds(current => current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId]);
  };
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
      account,
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
      if (account)
        search.set('account', account);
      navigate(`/chart/category?${search.toString()}`);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas text-ww-ink" data-chart-dashboard data-hide-amounts={hideAmounts}>
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-[max(10px,var(--ww-safe-area-top))]">
        <h1 className="text-[22px] font-extrabold">{t('dashboard.title')}</h1>
        <button aria-label={t('dashboard.filter')} className="grid size-11 place-items-center rounded-full bg-ww-surface-raised shadow-ww-xs" onClick={openFilter} type="button"><SlidersHorizontal size={18} /></button>
      </header>
      <div className="mx-4 grid shrink-0 grid-cols-5 rounded-full bg-ww-surface-tint p-1 text-center text-[13px]">
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
            className={`min-h-11 rounded-full px-1 ${period === item ? 'bg-ww-surface-raised font-bold text-primary-deep shadow-ww-xs' : 'text-ww-soft'}`}
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
                className="min-h-11 rounded-xl bg-ww-surface px-2 py-2"
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
                className="min-h-11 rounded-xl bg-ww-surface px-2 py-2"
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
              {period !== 'all' && <button aria-label={t('dashboard.previous')} className="grid size-11 place-items-center rounded-full bg-primary text-white" onClick={() => stepPeriod(-1)} type="button"><ChevronLeft size={20} /></button>}
              <span className="text-[15px] font-semibold text-ww-mid">{period === 'all' ? `${data?.startDate ?? '—'} ${t('dashboard.from')} ${data?.endDate ?? today}` : `${rangeStart}  —  ${rangeEnd}`}</span>
              {period !== 'all' && <button aria-label={t('dashboard.next')} className="grid size-11 place-items-center rounded-full bg-primary text-white disabled:opacity-40" disabled={periodEnd >= today} onClick={() => stepPeriod(1)} type="button"><ChevronRight size={20} /></button>}
            </div>
          )}
      <main className="ww-tab-bar-scroll-padding min-h-0 flex-1 space-y-3 overflow-y-auto px-4" data-dashboard-scroll>
        {query.isError && <button className="w-full rounded-2xl bg-ww-surface p-4 text-sm text-feedback-danger" onClick={() => void query.refetch()} type="button">{t('dashboard.loadError')}</button>}
        {query.isLoading && !data && <div className="h-40 animate-pulse rounded-3xl bg-ww-surface" />}
        {data && (
          <>
            <Surface className="p-4" material="content">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">{t('dashboard.summary')}</h2>
                <span className="text-xs text-ww-soft">{t('dashboard.days', { count: data.summary.dayCount })}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[[t('dashboard.expense'), data.summary.expense, 'text-ww-ink'], [t('dashboard.income'), data.summary.income, 'text-primary-deep'], [t('dashboard.net'), data.summary.net, 'text-ww-ink'], [t('dashboard.dailyAverage'), data.summary.averageDailyExpense, 'text-ww-mid']].map(([label, amount, color]) => (
                  <div key={label} className="rounded-2xl bg-ww-surface-tint p-3">
                    <div className="text-xs text-ww-soft">{label}</div>
                    <div className={`mt-1 font-number text-lg font-semibold ${color}`}>{money(amount, hideAmounts)}</div>
                  </div>
                ))}
              </div>
            </Surface>
            <Surface className="p-4" data-dashboard-section="trend" material="content">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">{t('dashboard.trend')}</h2>
                <div className="flex rounded-full bg-ww-surface-tint p-1">{(['expense', 'income', 'net'] as ChartDashboardMetric[]).map(item => <button key={item} className={`min-h-11 rounded-full px-3 text-xs ${metric === item ? 'bg-ww-surface-raised font-bold text-primary-deep shadow-ww-xs' : 'text-ww-soft'}`} onClick={() => setValue('metric', item)} type="button">{t(`dashboard.${item}`)}</button>)}</div>
              </div>
              <div className="h-28 border-b border-dashed border-border-primary px-1">
                <div className="relative h-full w-full">
                  <svg aria-label={t('dashboard.trend')} className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <line x1="0" x2="100" y1={trend.zeroY} y2={trend.zeroY} stroke="var(--ww-border-color)" strokeDasharray="2 3" strokeWidth="0.7" />
                    <line x1="0" x2="100" y1="8" y2="8" stroke="var(--ww-border-color)" strokeDasharray="2 3" strokeWidth="0.7" />
                    <line x1="0" x2="100" y1="92" y2="92" stroke="var(--ww-border-color)" strokeDasharray="2 3" strokeWidth="0.7" />
                    {trend.path && (
                      <>
                        <path d={`${trend.path} L 100 ${trend.zeroY} L 0 ${trend.zeroY} Z`} fill={metric === 'income' ? 'color-mix(in srgb, var(--ww-chart-2) 14%, transparent)' : 'color-mix(in srgb, var(--ww-chart-1) 14%, transparent)'} />
                        <path d={trend.path} fill="none" stroke={metric === 'income' ? 'var(--ww-chart-2)' : metric === 'net' ? 'var(--ww-chart-3)' : 'var(--ww-chart-1)'} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                  {trend.points.map((point, index) => (
                    <span
                      aria-label={`${data.timeline[index].label ?? data.timeline[index].key} ${money(String(chartValues[index]), hideAmounts)}`}
                      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ww-surface-raised"
                      key={data.timeline[index].key}
                      role="img"
                      style={{ backgroundColor: metric === 'income' ? 'var(--ww-chart-2)' : metric === 'net' ? 'var(--ww-chart-3)' : 'var(--ww-chart-1)', left: `${point.x}%`, top: `${point.y}%` }}
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
                  <div className="absolute inset-5 grid place-content-center rounded-full bg-ww-surface text-center">
                    <span className="text-[10px] text-ww-soft">{t(metric === 'income' ? 'dashboard.totalIncome' : 'dashboard.totalExpense')}</span>
                    <span className="font-number text-sm font-bold">{money(metric === 'income' ? data.summary.income : data.summary.expense, hideAmounts)}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {selectedCategories.map(item => (
                    <button className="flex min-h-11 w-full items-center gap-2 text-left text-xs" key={`${item.id ?? item.key}-${item.name}`} onClick={() => categoryRoute(item)} type="button">
                      <CategoryIcon categoryName={item.name} iconKey={item.icon ?? 'receipt'} iconType={item.iconType ?? 'BUILTIN'} textIconEnabled={item.textIconEnabled ?? false} textIconIndex={item.textIconIndex ?? 0} size={20} />
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
                  <div key={label} className="rounded-xl bg-ww-surface-tint p-3">
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
                    <div className="flex rounded-full bg-ww-surface-tint p-1">{(['netAsset', 'asset', 'liability'] as const).map(item => <button key={item} onClick={() => setAssetMetric(item)} className={`min-h-11 rounded-full px-2.5 text-[11px] ${assetMetric === item ? 'bg-ww-surface-raised font-bold text-primary-deep' : 'text-ww-soft'}`} type="button">{t(`dashboard.${item === 'asset' ? 'totalAsset' : item === 'liability' ? 'liability' : 'netAsset'}`)}</button>)}</div>
                  </div>
                  {latestAssetValue !== null
                    ? (
                        <div className="relative h-24 w-full border-b border-dashed border-border-primary">
                          <svg aria-label={t('dashboard.assets')} className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <line stroke="var(--ww-border-color)" strokeDasharray="2 3" strokeWidth="0.8" x1="0" x2="100" y1={assetGeometry?.zeroY ?? 92} y2={assetGeometry?.zeroY ?? 92} />
                            {assetGeometry?.paths.map(path => <path d={path} fill="none" key={path} stroke="var(--ww-chart-1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />)}
                          </svg>
                          {assetGeometry?.points.map(point => point && (
                            <span
                              aria-label={`${point.date}: ${money(point.value, hideAmounts)}`}
                              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ww-surface-raised bg-primary-mid"
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
      <ChartDashboardFilterSheet
        scope={scope}
        t={t}
        visible={filterOpen}
        availableTags={availableTags}
        canReadTags={canReadTags}
        ledgerOptions={ledgerOptions.data}
        householdMembers={householdFilterOptions.data.members}
        assets={assetOptions.data}
        draftTagIds={draftTagIds}
        draftTagMatch={draftTagMatch}
        draftAccount={draftAccount}
        draftSourceMemberId={draftSourceMemberId}
        onClose={() => setFilterOpen(false)}
        onNavigateLedger={ledgerId => navigate(ROUTES_PATH.LEDGER_CHARTS.getPath(ledgerId))}
        onTagsReset={() => {
          setDraftTagIds([]);
          setDraftTagMatch('any');
        }}
        onTagMatchChange={setDraftTagMatch}
        onTagToggle={toggleDraftTag}
        onAccountReset={() => setDraftAccount('')}
        onAccountChange={setDraftAccount}
        onSourceMemberChange={(value) => {
          setDraftSourceMemberId(value);
          if (value && Number(value) !== userQuery.data?.id)
            setDraftAccount('');
        }}
        onApply={applyFilterDraft}
      />
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
