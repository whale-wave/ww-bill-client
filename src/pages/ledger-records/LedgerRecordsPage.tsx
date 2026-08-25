import type { Ledger } from '@/entities/ledger';
import type { RecordEntry, RecordOverviewListGroup } from '@/entities/record';
import dayjs from 'dayjs';
import { CalendarDays, ReceiptText, Search, Settings, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  LedgerCapability,
  LedgerVisualIcon,
  useLedgerPreferencesQuery,
} from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  RecordMonthPicker,
  RecordOverviewPresentation,
  useLedgerRecordsQuery,
} from '@/entities/record';
import {
  buildMonthRecordRange,
  formatMonthStart,
} from '@/features/household';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { WorkspaceCapsule } from '@/features/workspace-navigation';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatLocalizedMonthDay, formatLocalizedYear } from '@/shared/lib';
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
  return isHidden ? '••••' : value.toFixed(2);
}

function groupRecords(
  records: readonly RecordEntry[],
  showDailySummary: boolean,
  locale: string,
  t: (key: string) => string,
  onRecordClick: (record: RecordEntry) => void,
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
      records: groupedRecords.map(record => ({
        amount: `${record.type === 'sub' ? '-' : ''}${Number(record.amount).toFixed(2)}`,
        amountTone: record.type === 'add' ? 'income' : 'expense',
        categoryName: record.category.name,
        iconName: record.category.icon,
        id: record.id,
        onClick: () => onRecordClick(record),
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
  const { i18n, t } = useTranslation('ledger');
  const navigate = useNavigate();
  const locale = i18n?.resolvedLanguage ?? i18n?.language ?? 'zh-CN';
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const filters = useMemo(() => buildMonthRecordRange(month), [month]);
  const query = useLedgerRecordsQuery({ params: { filters, ledgerId } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;
  const groups = useMemo(
    () => groupRecords(
      query.data.data,
      preferenceQuery.data?.showDailySummary !== false,
      locale,
      t,
      record => navigate(
        ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id),
        { state: createLedgerRecordDetailState(record, ledgerId) },
      ),
    ),
    [
      ledgerId,
      locale,
      navigate,
      preferenceQuery.data?.showDailySummary,
      query.data.data,
      t,
    ],
  );
  return (
    <RecordOverviewPresentation
      emptyDescription={t('home.emptyDescription')}
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      groups={groups}
      header={{
        actions: <WorkspaceCapsule scope={{ ledgerId, type: 'custom' }} />,
        metrics: [
          {
            key: 'income',
            label: t('home.income'),
            testId: 'ledger-monthly-income',
            value: formatAmount(query.data.income, isAmountHidden),
          },
          {
            key: 'expense',
            label: t('home.expense'),
            testId: 'ledger-monthly-expense',
            value: formatAmount(query.data.expend, isAmountHidden),
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
          <span className="flex h-[18px] w-[18px] flex-none overflow-hidden rounded-full">
            <LedgerVisualIcon
              iconKey={ledger.iconKey}
              kind={ledger.kind}
              templateKey={ledger.templateKey}
            />
          </span>
        ),
        titleAlignment: 'start',
      }}
      onRetry={() => void query.refetch()}
      retryLabel={t('common.retry')}
      renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
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
