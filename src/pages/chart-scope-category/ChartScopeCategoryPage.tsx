import type { FC, ReactNode } from 'react';
import type { FamilyRecord } from '@/entities/household';
import type { RecordEntry } from '@/entities/record';
import { ChevronLeft, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useLedgerTagRankingQuery } from '@/entities/chart';
import { useHouseholdRecordsQuery, useHouseholdTagRankingQuery } from '@/entities/household';
import { LedgerCapability } from '@/entities/ledger';
import { useLedgerRecordsQuery } from '@/entities/record';
import { CategoryTrendChart, TagRankingSection } from '@/features/chart-overview';
import { HouseholdScopeBoundary } from '@/features/household';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { GradientPanel, IllustratedEmptyState, MetricGrid, ProgressBar } from '@/shared/ui';

interface ChartDetailState {
  amount: number | string;
  category: { id: string | number; icon: string; name: string };
  endDate: string;
  percentage: string;
  periodName: string;
  startDate: string;
  type: 'add' | 'sub';
}

function readState(value: unknown): ChartDetailState | undefined {
  if (typeof value !== 'object' || value === null)
    return undefined;
  const state = value as Partial<ChartDetailState>;
  return state.category && state.startDate && state.endDate && state.type
    ? state as ChartDetailState
    : undefined;
}

export function CategoryDetail({ isRecordsLoading, records, state, tagRanking, toRecord }: { isRecordsLoading?: boolean; records: Array<RecordEntry | FamilyRecord>; state: ChartDetailState; tagRanking?: ReactNode; toRecord: (id: number) => string }) {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const [sort, setSort] = useState<'amount' | 'time'>('amount');
  const sortedRecords = useMemo(() => records
    .filter((record) => {
      const category = record.category;
      const categoryKey = category && 'key' in category ? category.key : undefined;
      return categoryKey
        ? categoryKey === String(state.category.id)
        : String(category?.id) === String(state.category.id);
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
      <header className="flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button aria-label={t('common:nav.back')} className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep" onClick={() => navigate(-1)} type="button"><ChevronLeft size={19} /></button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{state.category.name}</h1>
      </header>
      <main className="min-h-0 flex-grow overflow-y-auto px-[18px] pb-8">
        <div className="space-y-5">
          <section>
            <div className="mb-2 px-1">
              <p className="truncate text-[11px] font-semibold text-ww-mid">{state.periodName}</p>
            </div>
            <GradientPanel className="h-[212.5px] overflow-hidden px-5 pb-4 pt-5" elevation="high" surface="chart">
              <MetricGrid
                columns={2}
                items={[
                  { key: 'amount', label: t('categoryAmount'), suffix: '¥', tone: state.type === 'add' ? 'income' : 'primary', value: formatAmount(Number(state.amount)) },
                  { key: 'percent', label: t('percent'), tone: 'muted', value: `${state.percentage}%` },
                ]}
                variant="chart-summary"
              />
              <CategoryTrendChart records={sortedRecords} />
            </GradientPanel>
          </section>
          <section data-record-ranking>
            <div className="mb-2.5 flex items-end justify-between px-1">
              <h2 className="text-[15px] font-extrabold text-ww-ink">{t('ranking.title')}</h2>
              <div className="flex overflow-hidden rounded-lg border border-border-primary bg-white/70 p-0.5 text-[11px] font-semibold text-ww-soft">{(['amount', 'time'] as const).map(option => <button className={`rounded-md px-2 py-1 ${sort === option ? 'bg-primary-light/60 text-primary-deep' : ''}`} data-chart-category-sort={option} key={option} onClick={() => setSort(option)} type="button">{t(`recordSort.${option}`)}</button>)}</div>
            </div>
            <GradientPanel className="overflow-hidden px-4 py-1.5" elevation="standard" surface="glass">
              {isRecordsLoading
                ? <div className="flex min-h-[120px] items-center justify-center text-[13px] text-ww-soft">{t('common:nav.loading')}</div>
                : sortedRecords.length
                  ? sortedRecords.map((record) => {
                      const percentage = recordsAmount ? Number(record.amount) / recordsAmount : 0;
                      return (
                        <button className="flex h-[56px] w-full items-center gap-[11px] border-0 border-t border-solid border-border-primary bg-transparent py-[10px] text-left first:border-0" key={record.id} onClick={() => navigate(toRecord(record.id))} type="button">
                          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[rgba(111,194,220,0.16)] text-primary-deep"><CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} size={16} /></span>
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
            </GradientPanel>
          </section>
          {tagRanking}
        </div>
      </main>
    </div>
  );
}

const LedgerCategoryPage: FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const state = readState(useLocation().state);
  const query = useLedgerRecordsQuery({ params: { filters: state ? { endDate: state.endDate, startDate: state.startDate, type: state.type } : undefined, ledgerId }, queryOptions: { enabled: Boolean(state) } });
  const tagRanking = useLedgerTagRankingQuery({ params: { ledgerId, filters: state ? { categoryId: String(state.category.id), endDate: state.endDate, startDate: state.startDate, type: state.type } : { categoryId: '', type: 'sub' } }, enabled: Boolean(state) });
  if (!state)
    return null;
  return <CategoryDetail isRecordsLoading={query.isLoading} records={query.data.data} state={state} tagRanking={<TagRankingSection data={tagRanking.data} isError={tagRanking.isError} isLoading={tagRanking.isLoading} />} toRecord={recordId => ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId)} />;
};

const HouseholdCategoryPage: FC<{ householdId: string }> = ({ householdId }) => {
  const state = readState(useLocation().state);
  const query = useHouseholdRecordsQuery({ params: { filters: state ? { categoryKeys: [String(state.category.id)], endDate: state.endDate, limit: 50, startDate: state.startDate, type: state.type } : undefined, householdId }, queryOptions: { enabled: Boolean(state) } });
  const tagRanking = useHouseholdTagRankingQuery({ params: { householdId, filters: state ? { categoryKey: String(state.category.id), endDate: state.endDate, metric: state.type === 'sub' ? 'expense' : 'income', startDate: state.startDate } : { categoryKey: '', metric: 'expense' } }, queryOptions: { enabled: Boolean(state) } });
  if (!state)
    return null;
  return <CategoryDetail isRecordsLoading={query.isLoading} records={query.records} state={state} tagRanking={<TagRankingSection data={tagRanking.data} isError={tagRanking.isError} isLoading={tagRanking.isLoading} />} toRecord={recordId => ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(householdId, recordId)} />;
};

export function LedgerChartCategoryPage() {
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  return (
    <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
      {() => <LedgerCategoryPage ledgerId={ledgerId} />}
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
