import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { DatePicker, FloatingBubble } from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHouseholdCalendarQuery } from '@/entities/household';
import {
  formatMonthStart,
  HouseholdPageState,
  HouseholdRecordsPanel,
  HouseholdScopeBoundary,
} from '@/features/household';
import { RecordCalendarView } from '@/features/record-workspace';
import { useTranslation } from '@/shared/i18n';

const CalendarContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [defaultMonth] = useState(() => formatMonthStart(new Date()));
  const month = /^\d{4}-\d{2}-01$/.test(searchParams.get('month') ?? '')
    ? searchParams.get('month')!
    : defaultMonth;
  const [selectedDate, setSelectedDate] = useState(() => (
    dayjs().format('YYYY-MM') === month.slice(0, 7)
      ? dayjs().format('YYYY-MM-DD')
      : month
  ));
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: true },
  });
  const dayStats = useMemo(() => new Map(calendarQuery.days.map(day => [
    day.date,
    {
      expense: day.visibleExpense,
      hasRecords: day.recordCount > 0,
      income: day.visibleIncome,
    },
  ])), [calendarQuery.days]);

  const handleMonthClick = () => {
    void DatePicker.prompt({
      defaultValue: new Date(`${month}T00:00:00`),
      onConfirm: (value) => {
        const nextMonth = formatMonthStart(value);
        setSelectedDate(
          dayjs().isSame(value, 'month')
            ? dayjs().format('YYYY-MM-DD')
            : nextMonth,
        );
        setSearchParams({ month: nextMonth }, { replace: true });
      },
      precision: 'month',
      title: t('calendar.title'),
    });
  };

  const handleToday = () => {
    const today = dayjs();
    const nextMonth = formatMonthStart(today.toDate());
    setSelectedDate(today.format('YYYY-MM-DD'));
    setSearchParams({ month: nextMonth }, { replace: true });
  };

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={calendarQuery.isError}
      isLoading={calendarQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void calendarQuery.refetch()}
      retryLabel={t('common.retry')}
    >
      <RecordCalendarView
        backLabel={t('common:nav.back')}
        dayStats={dayStats}
        floatingAction={(
          <FloatingBubble
            axis="y"
            onClick={handleToday}
            style={{
              '--initial-position-bottom': '64px',
              '--initial-position-right': '18px',
              '--size': '58px',
            }}
          >
            <span className="text-sm text-font-black">{t('common:time.today')}</span>
          </FloatingBubble>
        )}
        month={new Date(`${month}T00:00:00`)}
        monthTitle={t('common.monthLabel', {
          month: Number(month.slice(5, 7)),
          year: month.slice(0, 4),
        })}
        onBack={() => navigate(-1)}
        onDateChange={date => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
        onMonthClick={handleMonthClick}
        onToday={handleToday}
        records={(
          <HouseholdRecordsPanel
            emptyDescription={t('calendar.emptyDay')}
            filters={{ endDate: selectedDate, startDate: selectedDate }}
            householdId={household.id}
            onSelect={record => navigate(`/households/${encodeURIComponent(household.id)}/records/${record.id}`)}
            showSummary={false}
          />
        )}
        selectedDate={new Date(`${selectedDate}T00:00:00`)}
        todayLabel={t('common:time.today')}
      />
    </HouseholdPageState>
  );
};

const HouseholdCalendarPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-white">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <CalendarContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdCalendarPage;
