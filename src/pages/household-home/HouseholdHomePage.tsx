import type { FC } from 'react';
import type { Household, HouseholdRecordSummary } from '@/entities/household';
import type { RecordEntry } from '@/entities/record';
import { Button, ErrorBlock } from 'antd-mobile';
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  Search,
  Settings,
  Target,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import { RecordList } from '@/entities/record';
import {
  buildMonthRecordRange,
  formatFamilyRecordDate,
  formatMonthStart,
  getFamilyRecordSubtitle,
  groupFamilyRecords,
  HouseholdBottomNav,
  HouseholdPageState,
  HouseholdScopeBoundary,
  toMoney,
} from '@/features/household';
import { RecordMonthPicker, RecordOverviewHeader } from '@/features/record-workspace';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const MENU_ITEMS = [
  { icon: BookOpenText, key: 'records', route: ROUTES_PATH.HOUSEHOLD_RECORDS },
  { icon: Target, key: 'budget', route: ROUTES_PATH.HOUSEHOLD_BUDGETS },
  { icon: Search, key: 'search', route: ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH },
  { icon: CalendarDays, key: 'calendar', route: ROUTES_PATH.HOUSEHOLD_CALENDAR },
  { icon: Settings, key: 'settings', route: ROUTES_PATH.HOUSEHOLD_SETTINGS },
] as const;

const HouseholdHomeContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const filters = buildMonthRecordRange(month);
  const query = useInfiniteHouseholdRecordsQuery({
    params: {
      filters: { ...filters, limit: 50, offset: 0 },
      householdId: household.id,
    },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const groups = useMemo(() => groupFamilyRecords(query.records), [query.records]);
  const recordsById = useMemo(
    () => new Map(query.records.map(record => [record.id, record])),
    [query.records],
  );
  const summary: HouseholdRecordSummary = query.data?.summary ?? { expense: '0', income: '0', net: '0' };
  const [year, monthNumber] = month.split('-');

  const handleRecord = (record: RecordEntry) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  };

  return (
    <>
      <RecordOverviewHeader
        actions={(
          <button
            aria-label={t('home.returnToPersonal')}
            className="household-web-return"
            onClick={() => navigate(ROUTES_PATH.DETAIL.getPath())}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            <span>{t('home.returnToPersonal')}</span>
          </button>
        )}
        metrics={[
          {
            content: (
              <RecordMonthPicker
                ariaLabel={t('common.monthLabel', { month: monthNumber, year })}
                monthLabel={t('common:time.month')}
                onChange={value => setMonth(formatMonthStart(value))}
                value={new Date(`${month}T00:00:00`)}
              />
            ),
            key: 'month',
            label: `${year}${t('common:time.year')}`,
          },
          {
            content: <span className="text-lg leading-[19px]">{toMoney(summary.income)}</span>,
            key: 'income',
            label: t('common.income'),
          },
          {
            content: <span className="text-lg leading-[19px]">{toMoney(summary.expense)}</span>,
            key: 'expense',
            label: t('common.expense'),
          },
        ]}
        shortcuts={MENU_ITEMS.map(({ icon: Icon, key, route }) => ({
          icon: <Icon aria-hidden="true" size={24} strokeWidth={1.8} />,
          key,
          label: t(`home.${key}`),
          onClick: () => navigate(route.getPath(household.id)),
          testId: `household-${key}`,
        }))}
        themeColor="var(--ww-theme-color)"
        title={t('home.title')}
        titleAlign="left"
      />

      <main className="min-h-0 flex-grow overflow-auto bg-white pb-[74px] pt-2">
        <HouseholdPageState
          errorDescription={t('common.loadErrorDescription')}
          errorTitle={t('common.loadError')}
          isError={query.isError && query.records.length === 0}
          isLoading={query.isLoading && query.records.length === 0}
          loadingLabel={t('common.loading')}
          onRetry={() => void query.refetch()}
          retryLabel={t('common.retry')}
        >
          <>
            <span className="sr-only">{t('records.total', { count: query.data?.total ?? 0 })}</span>
            {groups.length > 0
              ? groups.map(group => (
                  <RecordList
                    data={group}
                    dateLabel={formatFamilyRecordDate(group.date)}
                    getRecordSubtitle={(record) => {
                      const familyRecord = recordsById.get(record.id);
                      if (!familyRecord)
                        return;
                      return getFamilyRecordSubtitle(familyRecord);
                    }}
                    includeRecordInTotals={record => recordsById.get(record.id)?.counted ?? false}
                    key={group.date}
                    onRecordClick={handleRecord}
                  />
                ))
              : (
                  <div className="flex min-h-[280px] items-center justify-center bg-white px-4">
                    <ErrorBlock
                      description={t('home.emptyDescription')}
                      status="empty"
                      title={t('home.empty')}
                    />
                  </div>
                )}
            {query.hasNextPage && (
              <Button
                block
                data-testid="household-records-load-more"
                loading={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {t('records.loadMore')}
              </Button>
            )}
          </>
        </HouseholdPageState>
      </main>

      <HouseholdBottomNav
        active="details"
        chartsLabel={t('home.chartsTab')}
        detailsLabel={t('home.detailsTab')}
        onCharts={() => navigate(ROUTES_PATH.HOUSEHOLD_CHARTS.getPath(household.id))}
        onDetails={() => undefined}
      />
    </>
  );
};

const HouseholdHomePage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new household-shell relative overflow-hidden bg-white">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <HouseholdHomeContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdHomePage;
