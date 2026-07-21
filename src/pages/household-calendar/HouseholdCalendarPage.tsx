import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHouseholdCalendarQuery } from '@/entities/household';
import {
  formatMonthStart,
  HouseholdMonthPicker,
  HouseholdPageState,
  HouseholdRecordsPanel,
  HouseholdScopeBoundary,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const WEEKDAY_KEYS = ['weekdayMon', 'weekdayTue', 'weekdayWed', 'weekdayThu', 'weekdayFri', 'weekdaySat', 'weekdaySun'] as const;

function getMonthCells(monthStart: string) {
  const [year, month] = monthStart.split('-').map(Number);
  const count = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  return [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      date: undefined,
      key: `leading-${monthStart}-${index}`,
    })),
    ...Array.from({ length: count }, (_, index) => {
      const date = `${monthStart.slice(0, 8)}${String(index + 1).padStart(2, '0')}`;
      return { date, key: date };
    }),
  ];
}

const CalendarContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const [searchParams, setSearchParams] = useSearchParams();
  const [defaultMonth] = useState(() => formatMonthStart(new Date()));
  const month = /^\d{4}-\d{2}-01$/.test(searchParams.get('month') ?? '')
    ? searchParams.get('month')!
    : defaultMonth;
  const [selectedDate, setSelectedDate] = useState<string>();
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: true },
  });
  const dayMap = new Map(calendarQuery.days.map(day => [day.date, day]));

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
      <div className="space-y-3">
        <HouseholdMonthPicker
          month={month}
          nextLabel={t('common.nextMonth')}
          onChange={(next) => {
            setSelectedDate(undefined);
            setSearchParams({ month: next }, { replace: true });
          }}
          previousLabel={t('common.previousMonth')}
        />
        <section className="card-rounded bg-white p-2">
          <div className="grid grid-cols-7 text-center text-xs text-font-gray">
            {WEEKDAY_KEYS.map(key => <span className="py-2" key={key}>{t(`calendar.${key}`)}</span>)}
            {getMonthCells(month).map((cell) => {
              const day = cell.date ? dayMap.get(cell.date) : undefined;
              return cell.date
                ? (
                    <button
                      className={`min-h-[58px] border-0 bg-white p-1 text-sm ${selectedDate === cell.date ? 'rounded-lg bg-primary' : ''}`}
                      data-date={cell.date}
                      key={cell.key}
                      onClick={() => setSelectedDate(cell.date)}
                      type="button"
                    >
                      <span className="block text-font-black">{Number(cell.date.slice(-2))}</span>
                      {day && (
                        <span className="mt-1 block text-[10px] text-rose-500">
                          -
                          {Number(day.visibleExpense).toFixed(0)}
                        </span>
                      )}
                    </button>
                  )
                : <span key={cell.key} />;
            })}
          </div>
        </section>
        {selectedDate && (
          <section>
            <h2 className="mb-2 text-sm font-medium text-font-black">{t('calendar.selectedDate', { date: selectedDate })}</h2>
            <HouseholdRecordsPanel
              emptyDescription={t('calendar.emptyDay')}
              filters={{ endDate: selectedDate, startDate: selectedDate }}
              householdId={household.id}
              showSummary={false}
            />
          </section>
        )}
      </div>
    </HouseholdPageState>
  );
};

const HouseholdCalendarPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('calendar.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <CalendarContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdCalendarPage;
