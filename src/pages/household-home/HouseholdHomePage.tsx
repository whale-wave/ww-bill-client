import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { CalendarDays, List, Search, Settings, Target } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  patchHouseholdPreferencesApi,
  useHouseholdCalendarQuery,
  useHouseholdPreferencesQuery,
  useInfiniteHouseholdRecordsQuery,
} from '@/entities/household';
import { LedgerKind, LedgerVisualIcon } from '@/entities/ledger';
import {
  RecordMonthPicker,
  RecordOverviewPresentation,
  useDeleteRecordMutation,
} from '@/entities/record';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  buildMonthRecordRange,
  formatMonthStart,
  getApiErrorStatus,
  HouseholdBottomNav,
  HouseholdScopeBoundary,
  toHouseholdRecordOverviewGroups,
  toMoney,
} from '@/features/household';
import { WorkspaceCapsule } from '@/features/workspace-navigation';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import {
  confirmDangerousAction,
  DesignIcon,
  showAppActionSheet,
  showAppInfoDialog,
} from '@/shared/ui';

type ShortcutKey = 'records' | 'settings' | 'budget' | 'search' | 'calendar';

const SHORTCUTS: ReadonlyArray<{
  icon: typeof Target;
  key: ShortcutKey;
  route: (householdId: string) => string;
}> = [
  { icon: List, key: 'records', route: ROUTES_PATH.HOUSEHOLD_BILL.getPath },
  { icon: Target, key: 'budget', route: ROUTES_PATH.HOUSEHOLD_BUDGETS.getPath },
  { icon: Search, key: 'search', route: ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH.getPath },
  { icon: CalendarDays, key: 'calendar', route: ROUTES_PATH.HOUSEHOLD_CALENDAR.getPath },
  { icon: Settings, key: 'settings', route: ROUTES_PATH.HOUSEHOLD_SETTINGS.getPath },
];

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
  const preferenceQuery = useHouseholdPreferencesQuery({
    params: { householdId: household.id },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const { i18n, t } = useTranslation('household');
  const userQuery = useGetUserUserInfoQuery();
  const [deleteRecord, deleteState] = useDeleteRecordMutation();
  const deletingRecordIdRef = useRef<number>();
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;

  const handleRecord = useCallback((record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  }, [household.id, navigate]);

  const handleDelete = useCallback(async (record: FamilyRecord) => {
    if (deleteState.isLoading || deletingRecordIdRef.current !== undefined)
      return;
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('record:detail.delete'),
      description: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
    });
    if (!confirmed)
      return;
    deletingRecordIdRef.current = record.id;
    try {
      const response = await deleteRecord({ id: String(record.id), version: record.version });
      await Promise.allSettled([recordsQuery.refetch(), calendarQuery.refetch()]);
      Toast.show({ content: response.message || t('common:confirm.deleteSuccess'), icon: 'success' });
    }
    catch (error) {
      await Promise.allSettled([recordsQuery.refetch(), calendarQuery.refetch()]);
      Toast.show({ content: t(getApiErrorStatus(error) === 409 ? 'common.conflict' : 'common:api.requestFailed'), icon: 'fail' });
    }
    finally {
      deletingRecordIdRef.current = undefined;
    }
  }, [calendarQuery, deleteRecord, deleteState.isLoading, recordsQuery, t]);

  const handleExit = useCallback(() => {
    navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
  }, [navigate]);

  const handleToggleAmountVisibility = useCallback(() => {
    const preference = preferenceQuery.data;
    if (!preference)
      return;
    void patchHouseholdPreferencesApi(household.id, {
      hideTotalAmount: !preference.hideTotalAmount,
      version: preference.version,
    }).then(() => preferenceQuery.refetch());
  }, [household.id, preferenceQuery]);

  const handleShowMore = useCallback(() => {
    showAppActionSheet({
      actions: [
        {
          key: 'forward',
          onClick: () => Toast.show(t('home.forwardHint')),
          text: t('home.forward'),
        },
        {
          key: 'about',
          onClick: () => {
            void showAppInfoDialog({
              confirmText: t('common:nav.close'),
              description: t('home.aboutHint'),
              title: t('home.about'),
            });
          },
          text: t('home.about'),
        },
        {
          key: 'desktop',
          onClick: () => Toast.show(t('settings.comingSoon')),
          text: t('settings.desktop'),
        },
      ],
      cancelText: t('common:nav.cancel'),
      title: t('home.moreTitle'),
    });
  }, [t]);

  const groups = useMemo(() => toHouseholdRecordOverviewGroups(
    recordsQuery.records,
    {
      countedLabel: t('records.counted'),
      dailyExpenseLabel: t('records.dailyExpense'),
      dailyIncomeLabel: t('records.dailyIncome'),
      dailyTotals: calendarQuery.days,
      canDeleteRecord: record => record.creator.id === userQuery.data?.id,
      deleteLabel: t('record:detail.delete'),
      inheritedLabel: t('records.inherited'),
      locale: i18n.resolvedLanguage ?? i18n.language,
      memberLabel: name => t('records.memberAttribution', { name }),
      onSelect: handleRecord,
      onDelete: handleDelete,
      privateLabel: t('records.private'),
      uncountedLabel: t('records.uncounted'),
    },
  ), [calendarQuery.days, handleDelete, handleRecord, i18n.language, i18n.resolvedLanguage, recordsQuery.records, t, userQuery.data?.id]);

  return (
    <>
      <RecordOverviewPresentation
        emptyDescription={t('home.emptyDescription')}
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        groups={groups}
        header={{
          actions: (
            <WorkspaceCapsule
              onReturnPersonal={handleExit}
              onSwitch={handleShowMore}
              returnLabel={t('home.exit')}
              returnTestId="household-exit-action"
              scope={{ householdId: household.id, type: 'household' }}
              switchLabel={t('home.more')}
              switchTestId="household-more-action"
            />
          ),
          amountToggle: {
            content: <DesignIcon name={isAmountHidden ? 'amount-hidden' : 'amount-visible'} size={16} />,
            disabled: !preferenceQuery.data,
            onClick: handleToggleAmountVisibility,
          },
          metrics: [
            {
              key: 'income',
              label: t('common.income'),
              testId: 'household-monthly-income',
              value: isAmountHidden ? '＊＊＊＊＊' : toMoney(recordsQuery.data?.summary.income),
            },
            {
              key: 'expense',
              label: t('common.expense'),
              testId: 'household-monthly-expense',
              value: isAmountHidden ? '＊＊＊＊＊' : toMoney(recordsQuery.data?.summary.expense),
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
          shortcuts: SHORTCUTS.map(({ icon: ShortcutIcon, key, route }) => ({
            icon: <ShortcutIcon size={20} />,
            key,
            label: t(`home.${key}`),
            onClick: () => navigate(route(household.id)),
            testId: key === 'search'
              ? 'household-search-action'
              : key === 'calendar'
                ? 'household-calendar-action'
                : `household-${key}`,
          })),
          shortcutsTestId: 'household-shortcuts-card',
          testId: 'household-home-header',
          titleIcon: (
            <span className="flex h-full w-full overflow-hidden rounded-full">
              <LedgerVisualIcon kind={LedgerKind.SYSTEM_DEFAULT} />
            </span>
          ),
          titleAlignment: 'start',
        }}
        hasMore={Boolean(recordsQuery.hasNextPage)}
        onRetry={() => void recordsQuery.refetch()}
        isLoadingMore={recordsQuery.isFetchingNextPage}
        loadMoreLabel={t('records.loadMore')}
        loadMoreTestId="household-records-load-more"
        onLoadMore={recordsQuery.hasNextPage
          ? () => void recordsQuery.fetchNextPage()
          : undefined}
        retryLabel={t('common.retry')}
        renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
        state={recordsQuery.isLoading && !recordsQuery.data
          ? 'loading'
          : recordsQuery.isError && !recordsQuery.data
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
