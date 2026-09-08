import type { ReactNode } from 'react';
import type { Ledger } from '@/entities/ledger';
import type { RecordEntry, RecordOverviewListGroup } from '@/entities/record';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { CalendarDays, ReceiptText, Search, Settings, Target } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  LedgerCapability,
  LedgerVisualIcon,
  patchLedgerPreferencesApi,
  useLedgerPreferencesQuery,
} from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  getRecordListIndicators,
  RECORD_OVERVIEW_PAGE_SIZE,
  RecordMonthPicker,
  RecordOverviewPresentation,
  useDeleteLedgerRecordMutation,
  useInfiniteLedgerRecordsQuery,
} from '@/entities/record';
import {
  buildMonthRecordRange,
  formatMonthStart,
} from '@/features/household';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { WorkspaceCapsule } from '@/features/workspace-navigation';
import { getQueryViewState } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedMonthDay, formatLocalizedYear } from '@/shared/lib';
import { confirmDangerousAction, DesignIcon } from '@/shared/ui';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

interface LedgerShortcut {
  capability: LedgerCapability;
  icon: typeof Target;
  key: 'bill' | 'budget' | 'calendar' | 'search' | 'settings';
  route: (ledgerId: string) => string;
}

const LEDGER_SHORTCUTS: readonly LedgerShortcut[] = [
  {
    capability: LedgerCapability.RECORD_READ,
    icon: ReceiptText,
    key: 'bill',
    route: ROUTES_PATH.LEDGER_BILL.getPath,
  },
  {
    capability: LedgerCapability.BUDGET_READ,
    icon: Target,
    key: 'budget',
    route: ROUTES_PATH.LEDGER_BUDGET.getPath,
  },
  {
    capability: LedgerCapability.RECORD_READ,
    icon: Search,
    key: 'search',
    route: ROUTES_PATH.LEDGER_RECORD_SEARCH.getPath,
  },
  {
    capability: LedgerCapability.RECORD_READ,
    icon: CalendarDays,
    key: 'calendar',
    route: ROUTES_PATH.LEDGER_CALENDAR.getPath,
  },
  {
    capability: LedgerCapability.LEDGER_READ,
    icon: Settings,
    key: 'settings',
    route: ROUTES_PATH.LEDGER_SETTINGS.getPath,
  },
];

function formatAmount(value: number, isHidden: boolean) {
  return isHidden ? '＊＊＊＊＊' : value.toFixed(2);
}

function groupRecords(
  records: readonly RecordEntry[],
  showDailySummary: boolean,
  locale: string,
  t: (key: string) => string,
  onRecordClick: (record: RecordEntry) => void,
  onRecordDelete?: (record: RecordEntry) => void,
): RecordOverviewListGroup[] {
  const groups = new Map<string, RecordEntry[]>();

  records.forEach((record) => {
    const dateKey = dayjs(record.time).format('YYYY-MM-DD');
    const current = groups.get(dateKey);
    if (current)
      current.push(record);
    else
      groups.set(dateKey, [record]);
  });

  return Array.from(groups, ([dateKey, groupedRecords]) => {
    const dailyIncome = groupedRecords.reduce(
      (sum, record) => record.type === 'add' ? sum + Number(record.amount) : sum,
      0,
    );
    const dailyExpense = groupedRecords.reduce(
      (sum, record) => record.type === 'sub' ? sum + Number(record.amount) : sum,
      0,
    );

    return {
      dateLabel: formatLocalizedMonthDay(`${dateKey}T00:00:00`, locale),
      dateTime: dateKey,
      key: dateKey,
      records: groupedRecords.map((record) => {
        const indicators = getRecordListIndicators(record);
        return {
          amount: `${record.type === 'sub' ? '-' : ''}${Number(record.amount).toFixed(2)}`,
          amountTone: record.type === 'add' ? 'income' : 'expense',
          categoryName: record.category.name,
          hasAttachment: indicators.hasAttachment,
          iconName: record.category.icon,
          memberColorKey: record.creator?.colorKey,
          id: record.id,
          onClick: () => onRecordClick(record),
          originalAmount: record.originalAmount ? `-${Number(record.originalAmount).toFixed(2)}` : undefined,
          overviewSecondary: [indicators.adjustmentSummary, indicators.tagSummary].filter(Boolean).join(' · ') || undefined,
          primary: record.remark || record.category.name,
          ...(onRecordDelete
            ? {
                rightActions: [{
                  color: 'danger' as const,
                  key: 'delete',
                  onClick: (event) => {
                    event.stopPropagation();
                    onRecordDelete(record);
                  },
                  text: t('records.delete'),
                }],
              }
            : {}),
          secondary: `${record.category.name}${record.creator ? ` · @${record.creator.nickname || record.creator.name || record.creator.username || '成员'}` : ''}`,
        };
      }),
      summaries: showDailySummary
        ? [
            ...(dailyIncome > 0
              ? [{ key: 'income', label: t('home.income'), value: dailyIncome.toFixed(2) }]
              : []),
            ...(dailyExpense > 0
              ? [{ key: 'expense', label: t('home.expense'), value: dailyExpense.toFixed(2) }]
              : []),
          ]
        : [],
    };
  });
}

interface LedgerRecordsViewProps {
  ledger: Ledger;
  ledgerId: string;
  month: string;
  onRecordDelete?: (record: RecordEntry) => void;
  onToggleAmountVisibility: () => void;
  preferenceQuery: ReturnType<typeof useLedgerPreferencesQuery>;
  recordsQuery: ReturnType<typeof useInfiniteLedgerRecordsQuery>;
  setMonth: (month: string) => void;
}

function LedgerRecordsView({
  ledger,
  ledgerId,
  month,
  onRecordDelete,
  onToggleAmountVisibility,
  preferenceQuery,
  recordsQuery,
  setMonth,
}: LedgerRecordsViewProps) {
  const { i18n, t } = useTranslation('ledger');
  const navigate = useNavigate();
  const locale = i18n?.resolvedLanguage ?? i18n?.language ?? 'zh-CN';
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;
  const groups = useMemo(() => {
    const groupedRecords = groupRecords(
      recordsQuery.data.data,
      preferenceQuery.data?.showDailySummary !== false,
      locale,
      t,
      record => navigate(
        ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id),
        { state: createLedgerRecordDetailState(record, ledgerId) },
      ),
      onRecordDelete,
    );
    if (!recordsQuery.hasNextPage || groupedRecords.length === 0)
      return groupedRecords;
    const lastIndex = groupedRecords.length - 1;
    return groupedRecords.map((group, index) => (
      index === lastIndex ? { ...group, summaries: [] } : group
    ));
  }, [
    ledgerId,
    locale,
    navigate,
    onRecordDelete,
    preferenceQuery.data?.showDailySummary,
    recordsQuery.data.data,
    recordsQuery.hasNextPage,
    t,
  ]);
  const viewState = getQueryViewState({
    hasData: Boolean(recordsQuery.response),
    isError: recordsQuery.isError,
    isFetching: recordsQuery.isFetching,
    isLoading: recordsQuery.isLoading,
  });
  return (
    <RecordOverviewPresentation
      emptyDescription={t('home.emptyDescription')}
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      groups={groups}
      header={{
        actions: <WorkspaceCapsule scope={{ ledgerId, type: 'custom' }} />,
        amountToggle: preferenceQuery.data
          ? {
              content: <DesignIcon name={isAmountHidden ? 'amount-hidden' : 'amount-visible'} size={16} />,
              onClick: onToggleAmountVisibility,
            }
          : undefined,
        metrics: [
          {
            key: 'income',
            label: t('home.income'),
            testId: 'ledger-monthly-income',
            value: formatAmount(recordsQuery.data.income, isAmountHidden),
          },
          {
            key: 'expense',
            label: t('home.expense'),
            testId: 'ledger-monthly-expense',
            value: formatAmount(recordsQuery.data.expend, isAmountHidden),
          },
        ],
        period: {
          label: formatLocalizedYear(`${month}T00:00:00`, locale),
          value: (
            <RecordMonthPicker
              month={dayjs(month)}
              monthLabel={t('home.month')}
              onChange={value => setMonth(value.startOf('month').format('YYYY-MM-DD'))}
              testId="ledger-record-month-picker"
            />
          ),
          valueWidth: 'cell',
        },
        renderTitle: className => <h1 className={className}>{ledger.name}</h1>,
        shortcuts: LEDGER_SHORTCUTS.map(({ capability, icon: ShortcutIcon, key, route }) => ({
          disabled: !ledger.capabilities.includes(capability),
          icon: <ShortcutIcon size={20} />,
          key,
          label: t(`home.${key}`),
          ...(key === 'bill' ? { label: t('bill:title') } : {}),
          onClick: () => navigate(route(ledgerId)),
          testId: key === 'search'
            ? 'ledger-search-action'
            : key === 'calendar'
              ? 'ledger-calendar-action'
              : `ledger-${key}`,
        })),
        shortcutsTestId: 'ledger-record-shortcuts',
        testId: 'ledger-records-header',
        titleIcon: (
          <LedgerVisualIcon
            className="h-[18px] w-[18px] text-primary-deep"
            iconKey={ledger.iconKey}
            kind={ledger.kind}
            templateKey={ledger.templateKey}
          />
        ),
        titleIconContainerClassName: 'rounded-[12px] border border-white/80 bg-white/75 !bg-none text-primary-deep shadow-ww-xs',
        titleAlignment: 'start',
      }}
      onRetry={() => void recordsQuery.refetch()}
      hasMore={recordsQuery.hasNextPage === true}
      isLoadingMore={recordsQuery.isFetchingNextPage}
      loadMoreMode="scroll"
      loadMoreResetKey={month}
      onLoadMore={recordsQuery.hasNextPage
        ? () => recordsQuery.fetchNextPage({ throwOnError: true })
        : undefined}
      retryLabel={t('common.retry')}
      renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
      state={viewState.isInitialLoading ? 'loading' : viewState.isBlockingError ? 'error' : 'ready'}
    />
  );
}

function LedgerRecordDeleteActions({
  children,
  ledgerId,
  recordsQuery,
}: {
  children: (onRecordDelete: (record: RecordEntry) => void) => ReactNode;
  ledgerId: string;
  recordsQuery: ReturnType<typeof useInfiniteLedgerRecordsQuery>;
}) {
  const { t } = useTranslation('ledger');
  const [deleteRecord, deleteState] = useDeleteLedgerRecordMutation();
  const deletingRecordIdRef = useRef<number>();
  const handleDelete = useCallback(async (record: RecordEntry) => {
    if (deleteState.isLoading || deletingRecordIdRef.current !== undefined)
      return;
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('records.delete'),
      description: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
    });
    if (!confirmed)
      return;
    deletingRecordIdRef.current = record.id;
    try {
      await deleteRecord({ ledgerId, recordId: String(record.id), version: record.version });
      Toast.show({ content: t('common:confirm.deleteSuccess'), icon: 'success' });
    }
    catch (error) {
      await recordsQuery.refetch();
      const isConflict = typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
      Toast.show({ content: t(isConflict ? 'records.conflict' : 'records.deleteFailed'), icon: 'fail' });
    }
    finally {
      deletingRecordIdRef.current = undefined;
    }
  }, [deleteRecord, deleteState.isLoading, ledgerId, recordsQuery, t]);

  return <>{children(handleDelete)}</>;
}

function RecordsContent({ canDelete, ledger, ledgerId }: { canDelete: boolean; ledger: Ledger; ledgerId: string }) {
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const filters = useMemo(() => ({
    ...buildMonthRecordRange(month),
    limit: RECORD_OVERVIEW_PAGE_SIZE,
    offset: 0,
  }), [month]);
  const recordsQuery = useInfiniteLedgerRecordsQuery({ params: { filters, ledgerId } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const handleToggleAmountVisibility = useCallback(() => {
    const preference = preferenceQuery.data;
    if (!preference)
      return;
    void patchLedgerPreferencesApi(ledgerId, {
      hideTotalAmount: !preference.hideTotalAmount,
      version: preference.version,
    }).then(() => preferenceQuery.refetch());
  }, [ledgerId, preferenceQuery]);
  const viewProps = {
    ledger,
    ledgerId,
    month,
    onToggleAmountVisibility: handleToggleAmountVisibility,
    preferenceQuery,
    recordsQuery,
    setMonth,
  };

  if (!canDelete)
    return <LedgerRecordsView {...viewProps} />;

  return (
    <LedgerRecordDeleteActions ledgerId={ledgerId} recordsQuery={recordsQuery}>
      {onRecordDelete => <LedgerRecordsView {...viewProps} onRecordDelete={onRecordDelete} />}
    </LedgerRecordDeleteActions>
  );
}

function LedgerRecordsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  return (
    <>
      <RecordsContent canDelete={ledger.capabilities.includes(LedgerCapability.RECORD_DELETE)} ledger={ledger} ledgerId={ledgerId} />
      <LedgerWorkspaceTabBar
        activeKey="records"
        capabilities={ledger.capabilities}
        ledgerId={ledgerId}
      />
    </>
  );
}

export default function LedgerRecordsPage() {
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
        {scope => <LedgerRecordsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
