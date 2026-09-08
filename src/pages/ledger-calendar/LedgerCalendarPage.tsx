import type { Ledger } from '@/entities/ledger';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import {
  createLedgerRecordDetailState,
  RecordCalendarPresentation,
  toRecordSearchGroups,
  useLedgerRecordsQuery,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { getQueryViewState } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { money } from '@/shared/lib';

const CALENDAR_ADJACENT_STALE_TIME = 30_000;

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
  const previousMonth = month.subtract(1, 'month');
  const previousMonthQuery = useLedgerRecordsQuery({
    params: {
      filters: {
        endDate: previousMonth.endOf('month').format('YYYY-MM-DD'),
        startDate: previousMonth.startOf('month').format('YYYY-MM-DD'),
      },
      ledgerId,
    },
    queryOptions: { staleTime: CALENDAR_ADJACENT_STALE_TIME },
  });
  const nextMonth = month.add(1, 'month');
  const nextMonthQuery = useLedgerRecordsQuery({
    params: {
      filters: {
        endDate: nextMonth.endOf('month').format('YYYY-MM-DD'),
        startDate: nextMonth.startOf('month').format('YYYY-MM-DD'),
      },
      ledgerId,
    },
    queryOptions: {
      enabled: !nextMonth.isAfter(dayjs(), 'month'),
      staleTime: CALENDAR_ADJACENT_STALE_TIME,
    },
  });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const showDailySummary = preferenceQuery.data?.showDailySummary !== false;
  const isAmountHidden = preferenceQuery.data?.hideTotalAmount === true;
  const currentMonthRecords = query.data.data;
  const days = useMemo(() => {
    if (!showDailySummary)
      return [];
    const records = new Map<number, (typeof currentMonthRecords)[number]>();
    [previousMonthQuery.data.data, currentMonthRecords, nextMonthQuery.data.data]
      .forEach(result => result.forEach(record => records.set(record.id, record)));
    const map = new Map<string, { expense: string; income: string }>();
    records.forEach((record) => {
      const date = dayjs(record.time).format('YYYY-MM-DD');
      const total = map.get(date) ?? { expense: '0', income: '0' };
      if (record.type === 'add')
        total.income = money.add(total.income, record.amount);
      else
        total.expense = money.add(total.expense, record.amount);
      map.set(date, total);
    });
    return Array.from(map, ([date, total]) => ({
      date,
      expense: money.compare(total.expense, 0) > 0
        ? isAmountHidden ? '••••' : money.format(total.expense)
        : undefined,
      income: money.compare(total.income, 0) > 0
        ? isAmountHidden ? '••••' : money.format(total.income)
        : undefined,
    }));
  }, [currentMonthRecords, isAmountHidden, nextMonthQuery.data.data, previousMonthQuery.data.data, showDailySummary]);
  const selectedRecords = useMemo(() => currentMonthRecords.filter(record =>
    dayjs(record.time).isSame(selectedDate, 'day')), [currentMonthRecords, selectedDate]);
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
  const viewState = getQueryViewState({
    hasData: Boolean(query.response),
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
  });

  const syncDate = (date: dayjs.Dayjs) => {
    const next = new URLSearchParams(searchParams);
    next.set('selectTime', String(date.valueOf()));
    setSearchParams(next, { replace: true });
  };

  return (
    <RecordCalendarPresentation
      backLabel={t('common:nav.back')}
      canCreate={ledger.capabilities.includes(LedgerCapability.RECORD_CREATE)}
      collapseCalendarLabel={t('record:calendar.collapse')}
      days={days}
      emptyDescription={t('record:calendar.emptyDescription')}
      emptyLabel={t('records.empty')}
      errorDescription={t('common.loadErrorDescription')}
      expandCalendarLabel={t('record:calendar.expand')}
      groups={groups}
      month={month}
      onBack={onBack}
      onCreate={() => navigate(`${ROUTES_PATH.LEDGER_RECORD_CREATE.getPath(ledgerId)}?selectTime=${selectedDate.valueOf()}`)}
      onDateChange={(date) => {
        setSelectedDate(date);
        syncDate(date);
      }}
      onMonthChange={(value) => {
        const nextMonth = value.startOf('month');
        const nextDate = nextMonth.isSame(dayjs(), 'month')
          ? dayjs()
          : nextMonth;
        setMonth(nextMonth);
        setSelectedDate(nextDate);
        syncDate(nextDate);
      }}
      onRetry={() => void query.refetch()}
      onToday={() => {
        const today = dayjs();
        setMonth(today.startOf('month'));
        setSelectedDate(today);
        syncDate(today);
      }}
      recordCountLabel={count => t('record:calendar.recordCount', { count })}
      retryLabel={t('common.retry')}
      renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
      selectedDayLabel={t('record:calendar.selectedDay')}
      selectedDate={selectedDate}
      state={viewState.isInitialLoading ? 'loading' : viewState.isBlockingError ? 'error' : 'ready'}
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
