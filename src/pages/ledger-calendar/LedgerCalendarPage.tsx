import type { Ledger } from '@/entities/ledger';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  RecordCalendarPresentation,
  toRecordSearchGroups,
  useLedgerRecordsQuery,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function getInitialDate(value: string | null) {
  const parsed = value ? dayjs(Number(value)) : dayjs();
  return parsed.isValid() ? parsed : dayjs();
}

function CalendarContent({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const onBack = useWorkspaceBack({
    capabilities: ledger.capabilities,
    ledgerId,
    type: 'custom',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialDate(searchParams.get('selectTime')));
  const [month, setMonth] = useState(() => selectedDate.startOf('month'));
  const filters = useMemo(() => ({
    endDate: month.endOf('month').format('YYYY-MM-DD'),
    startDate: month.startOf('month').format('YYYY-MM-DD'),
  }), [month]);
  const query = useLedgerRecordsQuery({ params: { ledgerId, filters } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const showDailySummary = preferenceQuery.data?.showDailySummary !== false;
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;
  const days = useMemo(() => {
    if (!showDailySummary)
      return [];
    const map = new Map<string, { expense: number; income: number }>();
    query.data.data.forEach((record) => {
      const date = dayjs(record.time).format('YYYY-MM-DD');
      const total = map.get(date) ?? { expense: 0, income: 0 };
      if (record.type === 'add')
        total.income += Number(record.amount);
      else
        total.expense += Number(record.amount);
      map.set(date, total);
    });
    return Array.from(map, ([date, total]) => ({
      date,
      expense: total.expense
        ? isAmountHidden ? '••••' : total.expense.toFixed(2)
        : undefined,
      income: total.income
        ? isAmountHidden ? '••••' : total.income.toFixed(2)
        : undefined,
    }));
  }, [isAmountHidden, query.data.data, showDailySummary]);
  const selectedRecords = useMemo(() => query.data.data.filter(record =>
    dayjs(record.time).isSame(selectedDate, 'day')), [query.data.data, selectedDate]);
  const groups = useMemo(() => toRecordSearchGroups(selectedRecords, {
    expenseLabel: t('home.expense'),
    incomeLabel: t('home.income'),
    onRecordClick: record =>
      navigate(
        ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id),
        { state: createLedgerRecordDetailState(record, ledgerId) },
      ),
    showCategoryAsSecondary: true,
  }), [ledgerId, navigate, selectedRecords, t]);

  const syncDate = (date: dayjs.Dayjs) => {
    const next = new URLSearchParams(searchParams);
    next.set('selectTime', String(date.valueOf()));
    setSearchParams(next, { replace: true });
  };

  return (
    <RecordCalendarPresentation
      backLabel={t('common:nav.back')}
      canCreate={ledger.capabilities.includes(LedgerCapability.RECORD_CREATE)}
      days={days}
      emptyLabel={t('records.empty')}
      errorDescription={t('common.loadErrorDescription')}
      groups={groups}
      month={month}
      onBack={onBack}
      onCreate={() => navigate(`${ROUTES_PATH.LEDGER_RECORD_CREATE.getPath(ledgerId)}?selectTime=${selectedDate.valueOf()}`)}
      onDateChange={(date) => {
        setSelectedDate(date);
        syncDate(date);
      }}
      onMonthClick={() => {
        void DatePicker.prompt({
          defaultValue: month.toDate(),
          onConfirm: (value) => {
            const nextMonth = dayjs(value).startOf('month');
            const nextDate = nextMonth.isSame(dayjs(), 'month')
              ? dayjs()
              : nextMonth;
            setMonth(nextMonth);
            setSelectedDate(nextDate);
            syncDate(nextDate);
          },
          precision: 'month',
          title: t('record:calendar.selectMonth'),
        });
      }}
      onRetry={() => void query.refetch()}
      onToday={() => {
        const today = dayjs();
        setMonth(today.startOf('month'));
        setSelectedDate(today);
        syncDate(today);
      }}
      retryLabel={t('common.retry')}
      selectedDate={selectedDate}
      state={query.isLoading ? 'loading' : query.isError ? 'error' : 'ready'}
      todayLabel={t('common:time.today')}
    />
  );
}

export default function LedgerCalendarPage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
      {scope => <CalendarContent {...scope} />}
    </LedgerScopeBoundary>
  );
}
