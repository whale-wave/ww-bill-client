import type { FC, ReactNode } from 'react';
import type { FamilyRecord } from '@/entities/household';
import type { RecordEntry } from '@/entities/record';
import { ChevronLeft, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useLedgerTagRankingQuery } from '@/entities/chart';
import { useHouseholdTagRankingQuery, useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import { LedgerCapability } from '@/entities/ledger';
import { useInfiniteLedgerRecordsQuery } from '@/entities/record';
import { CategoryTrendChart, SubcategoryBreakdown, TagRankingSection } from '@/features/chart-overview';
import { HouseholdScopeBoundary } from '@/features/household';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { IllustratedEmptyState, MetricGrid, ProgressBar, Surface } from '@/shared/ui';

interface ChartDetailState {
  amount: number | string;
  category: { id: string | number; icon: string; iconType?: 'BUILTIN' | 'IMAGE'; name: string; textIconEnabled?: boolean; textIconIndex?: number };
  endDate: string;
  percentage: string;
  periodName: string;
  startDate: string;
  type: 'add' | 'sub';
  tagIds?: string[];
  tagMatch?: 'any' | 'all';
  account?: string;
  sourceMemberId?: number;
}

function readState(value: unknown, params: URLSearchParams): ChartDetailState | undefined {
  const saved = typeof value === 'object' && value !== null ? value as Partial<ChartDetailState> : undefined;
  const categoryId = params.get('categoryId');
  const categoryName = params.get('categoryName');
  const type = params.get('type');
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  const category = saved?.category ?? (categoryId && categoryName
    ? {
        id: categoryId,
        name: categoryName,
        icon: params.get('categoryIcon') ?? 'bill',
        iconType: params.get('categoryIconType') === 'IMAGE' ? 'IMAGE' as const : 'BUILTIN' as const,
      }
    : undefined);
  if (!category || !(saved?.startDate ?? startDate) || !(saved?.endDate ?? endDate) || !['add', 'sub'].includes(type ?? saved?.type ?? ''))
    return undefined;
  return {
    ...(saved as ChartDetailState | undefined),
    amount: saved?.amount ?? params.get('amount') ?? '0',
    category,
    endDate: (endDate ?? saved?.endDate)!,
    percentage: saved?.percentage ?? params.get('percentage') ?? '0',
    periodName: saved?.periodName ?? params.get('periodName') ?? `${startDate} — ${endDate}`,
    startDate: (startDate ?? saved?.startDate)!,
    type: (type ?? saved?.type) as 'add' | 'sub',
    tagIds: params.get('tagIds')?.split(',').filter(Boolean) ?? saved?.tagIds,
    tagMatch: params.get('tagMatch') === 'all' ? 'all' : params.get('tagMatch') === 'any' ? 'any' : saved?.tagMatch,
    account: params.get('account') ?? saved?.account,
    sourceMemberId: params.get('sourceMemberId') ? Number(params.get('sourceMemberId')) : saved?.sourceMemberId,
  };
}

export function CategoryDetail({ categoryBreakdown, hasMoreRecords, isLoadingMore, isRecordsLoading, loadMoreRecords, records, state, tagRanking, toRecord }: { categoryBreakdown?: Array<{ key: string; name: string; amount: string }>; hasMoreRecords?: boolean; isLoadingMore?: boolean; isRecordsLoading?: boolean; loadMoreRecords?: () => void; records: Array<RecordEntry | FamilyRecord>; state: ChartDetailState; tagRanking?: ReactNode; toRecord: (id: number) => string }) {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const [sort, setSort] = useState<'amount' | 'time'>('amount');
  const sortedRecords = useMemo(() => records
    .filter((record) => {
      const category = record.category;
      const categoryKey = category && 'key' in category ? category.key : undefined;
      return categoryKey
        ? categoryKey === String(state.category.id) || category?.parentKey === String(state.category.id)
        : String(category?.id) === String(state.category.id) || String(category?.parentId) === String(state.category.id);
    })
    .sort((left, right) => sort === 'amount'
      ? Number(right.amount) - Number(left.amount)
      : new Date(right.time).getTime() - new Date(left.time).getTime()), [records, sort, state.category.id]);
  const recordsAmount = useMemo(
    () => sortedRecords.reduce((sum, record) => sum + Number(record.amount), 0),
    [sortedRecords],
  );
  return (
    <div className="page-new relative overflow-hidden">
      <header className="flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,var(--ww-safe-area-top))]">
        <button aria-label={t('common:nav.back')} className="absolute left-[18px] flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep" onClick={() => navigate(-1)} type="button"><ChevronLeft size={19} /></button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{state.category.name}</h1>
      </header>
      <main className="min-h-0 flex-grow overflow-y-auto px-[18px] pb-8">
        <div className="space-y-5">
          <section>
            <div className="mb-2 px-1">
              <p className="truncate text-[11px] font-semibold text-ww-mid">{state.periodName}</p>
            </div>
            <Surface className="h-[212.5px] overflow-hidden px-5 pb-4 pt-5" material="raised">
              <MetricGrid
                columns={2}
                items={[
                  { key: 'amount', label: t('categoryAmount'), suffix: '¥', tone: state.type === 'add' ? 'income' : 'primary', value: formatAmount(Number(state.amount)) },
                  { key: 'percent', label: t('percent'), tone: 'muted', value: `${state.percentage}%` },
                ]}
                variant="chart-summary"
              />
              <CategoryTrendChart records={sortedRecords} />
            </Surface>
          </section>
          <section data-record-ranking>
            <div className="mb-2.5 flex items-end justify-between px-1">
              <h2 className="text-[15px] font-extrabold text-ww-ink">{t('ranking.title')}</h2>
              <div className="flex overflow-hidden rounded-lg border border-border-primary bg-white/70 p-0.5 text-[11px] font-semibold text-ww-soft">{(['amount', 'time'] as const).map(option => <button className={`rounded-md px-2 py-1 ${sort === option ? 'bg-primary-light/60 text-primary-deep' : ''}`} data-chart-category-sort={option} key={option} onClick={() => setSort(option)} type="button">{t(`recordSort.${option}`)}</button>)}</div>
            </div>
            <Surface className="overflow-hidden px-4 py-1.5" material="content">
              {isRecordsLoading
                ? <div className="flex min-h-[120px] items-center justify-center text-[13px] text-ww-soft">{t('common:nav.loading')}</div>
                : sortedRecords.length
                  ? sortedRecords.map((record) => {
                      const percentage = recordsAmount ? Number(record.amount) / recordsAmount : 0;
                      return (
                        <button className="flex h-[56px] w-full items-center gap-[11px] border-0 border-t border-solid border-border-primary bg-transparent py-[10px] text-left first:border-0" key={record.id} onClick={() => navigate(toRecord(record.id))} type="button">
                          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[rgba(111,194,220,0.16)] text-primary-deep"><CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} iconType={record.category?.iconType} textIconEnabled={record.category?.textIconEnabled} textIconIndex={record.category?.textIconIndex} size={16} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between">
                              <span className="truncate text-[13px] font-semibold leading-[19.5px] text-ww-ink">{record.remark || record.category?.name}</span>
                              <span className="ml-2 flex shrink-0 items-center gap-2">
                                <span className="font-number text-[10.5px] text-ww-soft">
                                  {(percentage * 100).toFixed(1)}
                                  %
                                </span>
                                <span className="font-number text-[13px] font-bold text-ww-mid">
                                  ¥
                                  {formatAmount(Number(record.amount))}
                                </span>
                              </span>
                            </span>
                            <span className="mt-[5px] block h-1 overflow-hidden rounded-full bg-black/5"><ProgressBar percent={percentage} /></span>
                          </span>
                        </button>
                      );
                    })
                  : <IllustratedEmptyState description={t('noRecordsHint')} icon={<ReceiptText size={32} />} title={t('noRecords')} />}
              {hasMoreRecords && <button className="w-full border-t border-border-primary py-3 text-sm font-semibold text-primary-deep disabled:opacity-50" disabled={isLoadingMore} onClick={loadMoreRecords} type="button">{isLoadingMore ? t('common:nav.loading') : t('dashboard.loadMore')}</button>}
            </Surface>
          </section>
          <SubcategoryBreakdown records={sortedRecords} items={categoryBreakdown} />
          {tagRanking}
        </div>
      </main>
    </div>
  );
}

const LedgerCategoryPage: FC<{ ledgerId: string; canReadTags: boolean }> = ({ ledgerId, canReadTags }) => {
  const [searchParams] = useSearchParams();
  const state = readState(useLocation().state, searchParams);
  const query = useInfiniteLedgerRecordsQuery({ params: { filters: state ? { categoryIds: [Number(state.category.id)], dateMode: 'range', endDate: state.endDate, startDate: state.startDate, type: state.type, tagIds: state.tagIds, tagMatch: state.tagMatch, account: state.account, limit: 50 } : undefined, ledgerId }, queryOptions: { enabled: Boolean(state) } });
  const tagRanking = useLedgerTagRankingQuery({ params: { ledgerId, filters: state ? { categoryId: String(state.category.id), endDate: state.endDate, startDate: state.startDate, type: state.type, tagIds: state.tagIds, tagMatch: state.tagMatch, account: state.account } : { categoryId: '', type: 'sub' } }, enabled: Boolean(state && canReadTags) });
  if (!state)
    return null;
  return <CategoryDetail hasMoreRecords={query.hasNextPage} isLoadingMore={query.isFetchingNextPage} isRecordsLoading={query.isLoading} loadMoreRecords={() => void query.fetchNextPage()} records={query.records} state={state} tagRanking={canReadTags ? <TagRankingSection data={tagRanking.data} fallbackRecords={query.records} isError={tagRanking.isError} isLoading={tagRanking.isLoading} /> : null} toRecord={recordId => ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId)} />;
};

const HouseholdCategoryPage: FC<{ householdId: string }> = ({ householdId }) => {
  const [searchParams] = useSearchParams();
  const state = readState(useLocation().state, searchParams);
  const query = useInfiniteHouseholdRecordsQuery({ params: { filters: state ? { categoryKeys: [String(state.category.id)], countedOnly: true, endDate: state.endDate, dateMode: 'range', startDate: state.startDate, type: state.type, tagIds: state.tagIds, tagMatch: state.tagMatch, account: state.account, ...(state.sourceMemberId ? { memberUserId: state.sourceMemberId } : {}), limit: 50 } : undefined, householdId }, queryOptions: { enabled: Boolean(state) } });
  const tagRanking = useHouseholdTagRankingQuery({ params: { householdId, filters: state ? { categoryKey: String(state.category.id), endDate: state.endDate, metric: state.type === 'sub' ? 'expense' : 'income', startDate: state.startDate, tagIds: state.tagIds, tagMatch: state.tagMatch, account: state.account, sourceMemberId: state.sourceMemberId } : { categoryKey: '', metric: 'expense' } }, queryOptions: { enabled: Boolean(state) } });
  if (!state)
    return null;
  return <CategoryDetail categoryBreakdown={query.data?.categoryBreakdown ?? []} hasMoreRecords={query.hasNextPage} isLoadingMore={query.isFetchingNextPage} isRecordsLoading={query.isLoading} loadMoreRecords={() => void query.fetchNextPage()} records={query.records} state={state} tagRanking={<TagRankingSection data={tagRanking.data} fallbackRecords={query.records} isError={tagRanking.isError} isLoading={tagRanking.isLoading} />} toRecord={recordId => ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(householdId, recordId)} />;
};

export function LedgerChartCategoryPage() {
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  return (
    <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
      {scope => <LedgerCategoryPage canReadTags={scope.ledger.capabilities.includes(LedgerCapability.TAG_READ)} ledgerId={ledgerId} />}
    </LedgerScopeBoundary>
  );
}

export function HouseholdChartCategoryPage() {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <HouseholdScopeBoundary householdId={householdId}>
      {() => <HouseholdCategoryPage householdId={householdId} />}
    </HouseholdScopeBoundary>
  );
}
