import type { FC } from 'react';
import type { ChartCategoryLocationState } from './model/chartCategoryUtils';
import { SpinLoading } from 'antd-mobile';
import {
  BarChart3,
  ChevronLeft,
  CircleAlert,
  ReceiptText,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useGetChartQuery, useTagRankingQuery } from '@/entities/chart';
import { CategoryTrendChart, ChartDisplaySwitch, TagRankingSection } from '@/features/chart-overview';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { GradientPanel, IllustratedEmptyState, MetricGrid, ProgressBar } from '@/shared/ui';
import {
  getMatchedRouteState,
  getPeriodFromState,
  getPeriodsFromData,
  getRecordsAmount,
  isAmountType,
  isTimeRangeCategory,
} from './model/chartCategoryUtils';

function displayAmount(value: number | string | undefined) {
  if (value === undefined || Number.isNaN(Number(value)))
    return '--';
  return formatAmount(Number(value));
}

const ChartCategory: FC = () => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state as ChartCategoryLocationState | null;

  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const tabKey = searchParams.get('tabKey');
  const hasRequiredParams = !!categoryId && isAmountType(type) && isTimeRangeCategory(category);

  const matchedRouteState = useMemo(() => {
    if (!categoryId || !isAmountType(type) || !isTimeRangeCategory(category))
      return undefined;
    return getMatchedRouteState(routeState, { categoryId, type, category, tabKey });
  }, [category, categoryId, routeState, tabKey, type]);

  const { data, isError, isFetching } = useGetChartQuery({
    params: {
      type: isAmountType(type) ? type : 'sub',
      category: isTimeRangeCategory(category) ? category : 'week',
      categoryId: categoryId || undefined,
    },
    options: { enabled: hasRequiredParams },
  });

  const periodsFromData = useMemo(() => {
    if (!isTimeRangeCategory(category))
      return [];
    return getPeriodsFromData(data, category);
  }, [category, data]);

  const periodFromState = useMemo(() => getPeriodFromState(matchedRouteState || null), [matchedRouteState]);
  const selectedPeriod = useMemo(() =>
    periodFromState || periodsFromData.find(item => item.key === tabKey) || periodsFromData.at(-1), [periodFromState, periodsFromData, tabKey]);

  const rankingItem = useMemo(() =>
    matchedRouteState?.rankingItem || selectedPeriod?.ranking?.find(item => String(item.category.id) === categoryId), [categoryId, matchedRouteState?.rankingItem, selectedPeriod]);

  const records = (selectedPeriod?.records || []).filter(record => String(record.category.id) === categoryId);
  const tagRange = useMemo(() => {
    const times = records.map(record => new Date(record.time).getTime()).filter(Number.isFinite).sort();
    return times.length ? { endDate: new Date(times.at(-1)! + 24 * 60 * 60 * 1000).toISOString(), startDate: new Date(times[0]!).toISOString() } : undefined;
  }, [records]);
  const tagRanking = useTagRankingQuery({
    params: { categoryId: categoryId ?? '', type: isAmountType(type) ? type : 'sub', ...tagRange },
    enabled: Boolean(categoryId && tagRange),
  });
  const [recordSort, setRecordSort] = useState<'amount' | 'time'>('amount');
  const [displayMode, setDisplayMode] = useState<'line' | 'pie'>('line');
  const sortedRecords = useMemo(() => [...records].sort((left, right) => {
    if (recordSort === 'amount')
      return Number(right.amount) - Number(left.amount);
    return new Date(right.time).getTime() - new Date(left.time).getTime();
  }), [recordSort, records]);
  const recordsAmount = useMemo(
    () => sortedRecords.reduce((sum, record) => sum + Number(record.amount), 0),
    [sortedRecords],
  );
  const totalAmount = rankingItem?.amount ?? (records.length ? getRecordsAmount(records) : undefined);
  const percentage = rankingItem?.percentage;
  const categoryInfo = rankingItem?.category || records[0]?.category;
  const periodName = matchedRouteState?.tabName || selectedPeriod?.name;
  const currentType = isAmountType(type) ? type : matchedRouteState?.amountType;
  const hasMatchedDisplayData = !!rankingItem || records.length > 0;

  const renderPageState = (kind: 'error' | 'missing') => (
    <div className="page-new relative overflow-hidden">
      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button
          aria-label={t('common:nav.back')}
          className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{t('categoryDetail')}</h1>
      </header>
      <main className="flex min-h-0 flex-grow items-center px-[18px] pb-12">
        <GradientPanel className="w-full" elevation="low" surface="glass">
          <IllustratedEmptyState
            description={kind === 'missing' ? t('missingParamsHint') : t('loadFailHint')}
            icon={kind === 'missing' ? <BarChart3 className="text-primary-deep" size={38} /> : <CircleAlert className="text-primary-deep" size={38} />}
            title={kind === 'missing' ? t('missingParams') : t('loadFail')}
          />
        </GradientPanel>
      </main>
    </div>
  );

  if (!hasRequiredParams)
    return renderPageState('missing');

  if (isError && !hasMatchedDisplayData)
    return renderPageState('error');

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-[46%] h-56 w-56 rounded-full bg-ww-pink-light/30 blur-3xl" />

      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button
          aria-label={t('common:nav.back')}
          className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{categoryInfo?.name || t('categoryDetail')}</h1>
      </header>

      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px] space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="truncate text-[11px] font-semibold text-ww-mid">
                {periodName || t('currentPeriod')}
                {currentType ? ` · ${t(`amount.${currentType === 'sub' ? 'expend' : 'income'}`)}` : ''}
              </p>
              <ChartDisplaySwitch value={displayMode} onChange={setDisplayMode} />
            </div>
            <GradientPanel className="h-[212.5px] overflow-hidden px-5 pb-4 pt-5" elevation="high" surface="chart">
              <MetricGrid
                columns={2}
                items={[
                  { key: 'amount', label: t('categoryAmount'), suffix: '¥', tone: currentType === 'add' ? 'income' : 'primary', value: displayAmount(totalAmount) },
                  { key: 'percent', label: t('percent'), tone: 'muted', value: percentage === undefined ? '--' : `${percentage}%` },
                ]}
                variant="chart-summary"
              />
              <CategoryTrendChart displayMode={displayMode} records={records} />
            </GradientPanel>
          </section>

          <TagRankingSection data={tagRanking.data} isError={tagRanking.isError} isLoading={tagRanking.isLoading} />

          <section>
            <div className="mb-2.5 flex items-end justify-between px-1">
              <div>
                <h2 className="text-[15px] font-extrabold leading-6 text-ww-ink">{t('ranking.title')}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-border-primary bg-white/70 p-0.5 text-[11px] font-semibold text-ww-soft">
                  {(['amount', 'time'] as const).map(sort => (
                    <button
                      className={`rounded-md px-2 py-1 ${recordSort === sort ? 'bg-primary-light/60 text-primary-deep' : ''}`}
                      data-chart-category-sort={sort}
                      key={sort}
                      onClick={() => setRecordSort(sort)}
                      type="button"
                    >
                      {t(`recordSort.${sort}`)}
                    </button>
                  ))}
                </div>
                {isFetching && <SpinLoading color="primary" style={{ '--size': '18px' }} />}
              </div>
            </div>

            <GradientPanel className="overflow-hidden px-4 py-1.5" elevation="standard" surface="glass">
              {sortedRecords.map((record) => {
                const percentage = recordsAmount ? Number(record.amount) / recordsAmount : 0;
                return (
                  <button
                    className="flex h-[56px] w-full items-center gap-[11px] border-0 border-t border-solid border-border-primary bg-transparent py-[10px] text-left first:border-0"
                    data-chart-category-record={record.id}
                    key={record.id}
                    onClick={() => navigate(`/editing/${record.id}`, { state: record })}
                    type="button"
                  >
                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[rgba(111,194,220,0.16)] text-primary-deep">
                      <CategoryIcon categoryName={record.category.name} iconKey={record.category.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between">
                        <span className="truncate text-[13px] font-semibold leading-[19.5px] text-ww-ink">{record.remark || record.category.name}</span>
                        <span className="ml-2 flex shrink-0 items-center gap-2">
                          <span className="font-number text-[10.5px] text-ww-soft">
                            {(percentage * 100).toFixed(1)}
                            %
                          </span>
                          <span className="font-number text-[13px] font-bold text-ww-mid">
                            ¥
                            {displayAmount(record.amount)}
                          </span>
                        </span>
                      </span>
                      <span className="mt-[5px] block h-1 overflow-hidden rounded-full bg-black/5"><ProgressBar percent={percentage} /></span>
                    </span>
                  </button>
                );
              })}

              {!records.length && !isFetching && (
                <IllustratedEmptyState
                  className="min-h-[270px]"
                  description={t('noRecordsHint')}
                  icon={<ReceiptText className="text-primary-deep" size={38} />}
                  testId="chart-category-empty"
                  title={t('noRecords')}
                />
              )}

              {!records.length && isFetching && (
                <div className="flex min-h-[220px] items-center justify-center">
                  <SpinLoading color="primary" />
                </div>
              )}
            </GradientPanel>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ChartCategory;
