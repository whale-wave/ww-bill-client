import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import dayjs from 'dayjs';
import { CalendarDays, List, Search, Settings, Target } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useHouseholdCalendarQuery, useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import {
  RecordMonthPicker,
  RecordOverviewPresentation,
} from '@/entities/record';
import {
  buildMonthRecordRange,
  formatMonthStart,
  HouseholdBottomNav,
  HouseholdScopeBoundary,
  toHouseholdRecordOverviewGroups,
  toMoney,
} from '@/features/household';
import { WorkspaceCapsule } from '@/features/workspace-navigation';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon } from '@/shared/ui';

const MENU_ITEMS = [
  { icon: List, key: 'records', route: ROUTES_PATH.HOUSEHOLD_RECORDS },
  { icon: Settings, key: 'settings', route: ROUTES_PATH.HOUSEHOLD_SETTINGS },
  { icon: Target, key: 'budget', route: ROUTES_PATH.HOUSEHOLD_BUDGETS },
  { icon: Search, key: 'search', route: ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH },
  { icon: CalendarDays, key: 'calendar', route: ROUTES_PATH.HOUSEHOLD_CALENDAR },
] as const;

const HouseholdHomeContent: FC<{ household: Household }> = ({ household }) => {
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const navigate = useNavigate();
  const filters = buildMonthRecordRange(month);
  const recordsQuery = useInfiniteHouseholdRecordsQuery({
    params: { filters: { ...filters, limit: 50, offset: 0 }, householdId: household.id },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const { i18n, t } = useTranslation('household');

  const handleRecord = useCallback((record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  }, [household.id, navigate]);

  const groups = useMemo(() => toHouseholdRecordOverviewGroups(
    recordsQuery.records,
    {
      countedLabel: t('records.counted'),
      dailyExpenseLabel: t('records.dailyExpense'),
      dailyIncomeLabel: t('records.dailyIncome'),
      dailyTotals: calendarQuery.days,
      inheritedLabel: t('records.inherited'),
      locale: i18n.resolvedLanguage ?? i18n.language,
      memberLabel: name => t('records.memberAttribution', { name }),
      onSelect: handleRecord,
      privateLabel: t('records.private'),
      uncountedLabel: t('records.uncounted'),
    },
  ), [calendarQuery.days, handleRecord, i18n.language, i18n.resolvedLanguage, recordsQuery.records, t]);

  return (
    <>
      <RecordOverviewPresentation
        emptyDescription={t('home.emptyDescription')}
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        groups={groups}
        header={{
          actions: <WorkspaceCapsule scope={{ householdId: household.id, type: 'household' }} />,
          metrics: [
            {
              key: 'income',
              label: t('common.income'),
              testId: 'household-monthly-income',
              value: toMoney(recordsQuery.data?.summary.income),
            },
            {
              key: 'expense',
              label: t('common.expense'),
              testId: 'household-monthly-expense',
              value: toMoney(recordsQuery.data?.summary.expense),
            },
          ],
          period: {
            label: t('common.yearLabel', { year: month.slice(0, 4) }),
            value: (
              <RecordMonthPicker
                month={dayjs(month)}
                monthLabel={t('common:time.month')}
                onChange={value => setMonth(value.startOf('month').format('YYYY-MM-DD'))}
                testId="household-record-month-picker"
              />
            ),
            valueWidth: 'cell',
          },
          renderTitle: className => (
            <h1 className={className}>{t('home.title')}</h1>
          ),
          shortcuts: MENU_ITEMS.map(({ icon: ShortcutIcon, key, route }) => ({
            icon: <ShortcutIcon size={20} />,
            key,
            label: key === 'records' ? t('records.title') : t(`home.${key}`),
            onClick: () => navigate(route.getPath(household.id)),
            testId: key === 'search'
              ? 'household-search-action'
              : key === 'calendar'
                ? 'household-calendar-action'
                : `household-${key}`,
          })),
          shortcutsTestId: 'household-shortcuts-card',
          testId: 'household-home-header',
          titleIcon: <DesignIcon name="ledger" size={15} />,
          titleAlignment: 'start',
        }}
        onRetry={() => void recordsQuery.refetch()}
        isLoadingMore={recordsQuery.isFetchingNextPage}
        loadMoreLabel={t('records.loadMore')}
        loadMoreTestId="household-records-load-more"
        onLoadMore={recordsQuery.hasNextPage
          ? () => void recordsQuery.fetchNextPage()
          : undefined}
        retryLabel={t('common.retry')}
        renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
        state={recordsQuery.isLoading
          ? 'loading'
          : recordsQuery.isError
            ? 'error'
            : 'ready'}
      />
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <HouseholdHomeContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdHomePage;
