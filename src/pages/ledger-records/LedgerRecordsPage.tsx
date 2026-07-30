import type { Ledger } from '@/entities/ledger';
import type { RecordEntry, RecordOverviewListGroup } from '@/entities/record';
import dayjs from 'dayjs';
import { CalendarDays, ReceiptText, Search, Settings, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import {
  RecordMonthPicker,
  RecordOverviewPresentation,
  useLedgerRecordsQuery,
} from '@/entities/record';
import {
  buildMonthRecordRange,
  formatMonthStart,
} from '@/features/household';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { LedgerTitleSwitcher } from '@/features/ledger-switcher';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

interface LedgerShortcut {
  capability: LedgerCapability;
  icon: typeof Target;
  key: 'bill' | 'budget' | 'settings';
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
    capability: LedgerCapability.LEDGER_READ,
    icon: Settings,
    key: 'settings',
    route: ROUTES_PATH.LEDGER_SETTINGS.getPath,
  },
];

function formatAmount(value: number, isHidden: boolean) {
  return isHidden ? '••••' : value.toFixed(2);
}

function groupRecords(
  records: readonly RecordEntry[],
  showDailySummary: boolean,
  t: (key: string) => string,
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
      dateLabel: dayjs(dateKey).format('M月D日ddd'),
      dateTime: dateKey,
      key: dateKey,
      records: groupedRecords.map(record => ({
        amount: `${record.type === 'sub' ? '-' : ''}${Number(record.amount).toFixed(2)}`,
        iconName: record.category.icon,
        id: record.id,
        primary: record.remark || record.category.name,
        secondary: record.category.name,
      })),
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

function RecordsContent({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const filters = useMemo(() => buildMonthRecordRange(month), [month]);
  const query = useLedgerRecordsQuery({ params: { filters, ledgerId } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;
  const groups = useMemo(
    () => groupRecords(
      query.data.data,
      preferenceQuery.data?.showDailySummary !== false,
      t,
    ).map(group => ({
      ...group,
      records: group.records.map(record => ({
        ...record,
        onClick: () => navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id)),
      })),
    })),
    [
      ledgerId,
      navigate,
      preferenceQuery.data?.showDailySummary,
      query.data.data,
      t,
    ],
  );
  return (
    <RecordOverviewPresentation
      emptyDescription={t('home.empty')}
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      groups={groups}
      header={{
        actions: (
          <>
            <button
              aria-label={t('home.search')}
              className="border-0 bg-transparent p-0"
              data-testid="ledger-search-action"
              onClick={() => navigate(ROUTES_PATH.LEDGER_RECORD_SEARCH.getPath(ledgerId))}
              type="button"
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <button
              aria-label={t('home.calendar')}
              className="border-0 bg-transparent p-0"
              data-testid="ledger-calendar-action"
              onClick={() => navigate(ROUTES_PATH.LEDGER_CALENDAR.getPath(ledgerId))}
              type="button"
            >
              <CalendarDays size={18} strokeWidth={2} />
            </button>
          </>
        ),
        metrics: [
          {
            key: 'income',
            label: t('home.income'),
            testId: 'ledger-monthly-income',
            value: (
              <span className="truncate text-base font-medium text-emerald-700">
                {formatAmount(query.data.income, isAmountHidden)}
              </span>
            ),
          },
          {
            key: 'expense',
            label: t('home.expense'),
            testId: 'ledger-monthly-expense',
            value: (
              <span className="truncate text-base font-medium text-rose-600">
                {formatAmount(query.data.expend, isAmountHidden)}
              </span>
            ),
          },
        ],
        period: {
          label: `${month.slice(0, 4)}年`,
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
        renderTitle: className => (
          <LedgerTitleSwitcher className={className} ledgerName={ledger.name} />
        ),
        shortcuts: LEDGER_SHORTCUTS.map(({ capability, icon: ShortcutIcon, key, route }) => ({
          disabled: !ledger.capabilities.includes(capability),
          icon: <ShortcutIcon size={20} />,
          key,
          label: t(`home.${key}`),
          ...(key === 'bill' ? { label: t('bill:title') } : {}),
          onClick: () => navigate(route(ledgerId)),
          testId: `ledger-${key}`,
        })),
        shortcutsTestId: 'ledger-record-shortcuts',
        testId: 'ledger-records-header',
      }}
      onRetry={() => void query.refetch()}
      retryLabel={t('common.retry')}
      state={query.isLoading ? 'loading' : query.isError ? 'error' : 'ready'}
    />
  );
}

function LedgerRecordsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  return (
    <>
      <RecordsContent ledger={ledger} ledgerId={ledgerId} />
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
