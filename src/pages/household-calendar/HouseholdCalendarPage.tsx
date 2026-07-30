import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

function getInitialMonth(month: string | null) {
  return month && /^\d{4}-\d{2}-01$/.test(month) ? dayjs(month) : dayjs();
}

const HouseholdCalendarContent: FC<{ household: Household }> = ({ household }) => {
  const { i18n, t } = useTranslation('household');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(() => getInitialMonth(searchParams.get('month')));
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(() => {
    const initialMonth = getInitialMonth(searchParams.get('month'));
    return initialMonth.isSame(dayjs(), 'month') ? dayjs() : initialMonth;
  });
  const month = selectMonthValue.startOf('month').format('YYYY-MM-DD');
  const selectedDate = selectDateValue.format('YYYY-MM-DD');
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: true },
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
  const handleDatePicker = useCallback(() => {
    void DatePicker.prompt({
      defaultValue: selectMonthValue.toDate(),
      onConfirm: (value) => {
        const nextMonth = dayjs(value);
        if (selectMonthValue.isSame(nextMonth, 'month'))
          return;
        const nextDate = dayjs().isSame(nextMonth, 'month') ? dayjs() : nextMonth.startOf('day');
        setSelectMonthValue(nextMonth);
        setSelectDateValue(nextDate);
        setSearchParams({ month: nextMonth.startOf('month').format('YYYY-MM-DD') }, { replace: true });
      },
      precision: 'month',
      title: t('record:calendar.selectMonth'),
    });
  }, [selectMonthValue, setSearchParams, t]);

  const handleChangeDate = useCallback((date: Date | null) => {
    if (date)
      setSelectDateValue(dayjs(date));
  }, []);

  const handleToToday = useCallback(() => {
    if (isToday(selectDateValue))
      return;
    const today = dayjs();
    setSelectMonthValue(today);
    setSelectDateValue(today);
    setSearchParams({ month: today.startOf('month').format('YYYY-MM-DD') }, { replace: true });
  }, [isToday, selectDateValue, setSearchParams]);

  const handleCreateRecord = useCallback(() => {
    navigate(`${ROUTES_PATH.BOOKKEEPING.getPath()}?selectTime=${selectDateValue.valueOf()}`);
  }, [navigate, selectDateValue]);

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
  const days = useMemo(() => calendarQuery.days.map(day => ({
    date: day.date,
    expense: Number(day.visibleExpense) ? Number(day.visibleExpense) : undefined,
    income: Number(day.visibleIncome) ? Number(day.visibleIncome) : undefined,
  })), [calendarQuery.days]);

  return (
    <RecordCalendarPresentation
      backLabel={t('common:nav.back')}
      days={days}
      emptyLabel={t('calendar.emptyDay')}
      errorDescription={t('common.loadErrorDescription')}
      groups={groups}
      month={selectMonthValue}
      onBack={() => navigate(-1)}
      onCreate={handleCreateRecord}
      onDateChange={date => handleChangeDate(date.toDate())}
      onMonthClick={handleDatePicker}
      onRetry={() => void Promise.all([calendarQuery.refetch(), recordsQuery.refetch()])}
      onToday={handleToToday}
      retryLabel={t('common.retry')}
      selectedDate={selectDateValue}
      state={calendarQuery.isLoading || recordsQuery.isLoading
        ? 'loading'
        : calendarQuery.isError || recordsQuery.isError
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
