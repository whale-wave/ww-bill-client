import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { Household } from '@/entities/household';
import type { RecordEditorLocationState } from '@/features/record-editor';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  useHouseholdCalendarQuery,
  useInfiniteHouseholdRecordsQuery,
} from '@/entities/household';
import { RecordCalendarPresentation } from '@/entities/record';
import {
  HouseholdScopeBoundary,
  toHouseholdRecordOverviewGroups,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { money } from '@/shared/lib';

const CALENDAR_ADJACENT_STALE_TIME = 30_000;

function getInitialDate(selectTime: string | null, legacyMonth: string | null) {
  const parsedSelectTime = selectTime ? dayjs(Number(selectTime)) : undefined;
  if (parsedSelectTime?.isValid())
    return parsedSelectTime;
  if (!legacyMonth || !/^\d{4}-\d{2}-01$/.test(legacyMonth))
    return dayjs();
  const legacyDate = dayjs(legacyMonth);
  return legacyDate.isSame(dayjs(), 'month') ? dayjs() : legacyDate;
}

const HouseholdCalendarContent: FC<{ household: Household }> = ({ household }) => {
  const { i18n, t } = useTranslation('household');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialDate] = useState(
    () => getInitialDate(searchParams.get('selectTime'), searchParams.get('month')),
  );
  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(() => initialDate.startOf('month'));
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(() => initialDate);
  const month = selectMonthValue.startOf('month').format('YYYY-MM-DD');
  const selectedDate = selectDateValue.format('YYYY-MM-DD');
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: true },
  });
  const previousMonth = selectMonthValue.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  const previousMonthQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month: previousMonth },
    queryOptions: { enabled: true, staleTime: CALENDAR_ADJACENT_STALE_TIME },
  });
  const nextMonthValue = selectMonthValue.add(1, 'month');
  const nextMonth = nextMonthValue.startOf('month').format('YYYY-MM-DD');
  const nextMonthQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month: nextMonth },
    queryOptions: {
      enabled: !nextMonthValue.isAfter(dayjs(), 'month'),
      staleTime: CALENDAR_ADJACENT_STALE_TIME,
    },
  });
  const recordsQuery = useInfiniteHouseholdRecordsQuery({
    params: {
      filters: {
        endDate: selectedDate,
        limit: 50,
        offset: 0,
        startDate: selectedDate,
      },
      householdId: household.id,
    },
    queryOptions: { enabled: true },
  });
  const isToday = useCallback((date: Date | Dayjs) => {
    return dayjs().isSame(dayjs(date), 'day');
  }, []);
  const syncSelectedDate = useCallback((date: Dayjs) => {
    const next = new URLSearchParams(searchParams);
    next.set('selectTime', String(date.valueOf()));
    next.delete('month');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);
  const handleMonthChange = useCallback((month: Dayjs) => {
    const nextMonth = month.startOf('month');
    if (selectMonthValue.isSame(nextMonth, 'month'))
      return;
    const nextDate = dayjs().isSame(nextMonth, 'month') ? dayjs() : nextMonth;
    setSelectMonthValue(nextMonth);
    setSelectDateValue(nextDate);
    syncSelectedDate(nextDate);
  }, [selectMonthValue, syncSelectedDate]);

  const handleChangeDate = useCallback((date: Date | null) => {
    if (!date)
      return;
    const nextDate = dayjs(date);
    setSelectDateValue(nextDate);
    syncSelectedDate(nextDate);
  }, [syncSelectedDate]);

  const handleToToday = useCallback(() => {
    if (isToday(selectDateValue))
      return;
    const today = dayjs();
    setSelectMonthValue(today);
    setSelectDateValue(today);
    syncSelectedDate(today);
  }, [isToday, selectDateValue, syncSelectedDate]);

  const handleCreateRecord = useCallback(() => {
    const selectTime = selectDateValue.valueOf();
    const state: RecordEditorLocationState = {
      recordEditor: {
        returnContext: {
          householdId: household.id,
          kind: 'household-calendar',
          selectTime,
        },
      },
    };
    navigate(`${ROUTES_PATH.BOOKKEEPING.getPath()}?selectTime=${selectTime}`, { state });
  }, [household.id, navigate, selectDateValue]);

  const groups = useMemo(() => toHouseholdRecordOverviewGroups(
    recordsQuery.records,
    {
      countedLabel: t('records.counted'),
      inheritedLabel: t('records.inherited'),
      locale: i18n.resolvedLanguage ?? i18n.language,
      memberLabel: name => t('records.memberAttribution', { name }),
      onSelect: record =>
        navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id)),
      privateLabel: t('records.private'),
      uncountedLabel: t('records.uncounted'),
    },
  ), [household.id, i18n.language, i18n.resolvedLanguage, navigate, recordsQuery.records, t]);
  const days = useMemo(() => {
    const calendarDays = new Map(
      [previousMonthQuery.days, calendarQuery.days, nextMonthQuery.days]
        .flat()
        .map(day => [day.date, day]),
    );
    return [...calendarDays.values()].map(day => ({
      date: day.date,
      expense: money.compare(day.visibleExpense, 0) > 0
        ? money.formatNatural(day.visibleExpense)
        : undefined,
      income: money.compare(day.visibleIncome, 0) > 0
        ? money.formatNatural(day.visibleIncome)
        : undefined,
    }));
  }, [calendarQuery.days, nextMonthQuery.days, previousMonthQuery.days]);

  return (
    <RecordCalendarPresentation
      backLabel={t('common:nav.back')}
      collapseCalendarLabel={t('record:calendar.collapse')}
      days={days}
      emptyDescription={t('record:calendar.emptyDescription')}
      emptyLabel={t('calendar.emptyDay')}
      errorDescription={t('common.loadErrorDescription')}
      expandCalendarLabel={t('record:calendar.expand')}
      groups={groups}
      month={selectMonthValue}
      onBack={() => navigate(-1)}
      onCreate={handleCreateRecord}
      onDateChange={date => handleChangeDate(date.toDate())}
      onMonthChange={handleMonthChange}
      onRetry={() => void Promise.all([calendarQuery.refetch(), recordsQuery.refetch()])}
      onToday={handleToToday}
      recordCountLabel={count => t('record:calendar.recordCount', { count })}
      retryLabel={t('common.retry')}
      renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
      selectedDayLabel={t('record:calendar.selectedDay')}
      selectedDate={selectDateValue}
      state={(calendarQuery.isLoading && !calendarQuery.response) || (recordsQuery.isLoading && !recordsQuery.data)
        ? 'loading'
        : (calendarQuery.isError && !calendarQuery.response) || (recordsQuery.isError && !recordsQuery.data)
            ? 'error'
            : 'ready'}
      todayLabel={t('common:time.today')}
    />
  );
};

const HouseholdCalendarPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();

  return (
    <div data-testid="household-calendar-page">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <HouseholdCalendarContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdCalendarPage;
