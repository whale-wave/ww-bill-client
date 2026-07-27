import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import {
  CalendarPickerView,
  DatePicker,
  FloatingBubble,
  NavBar,
} from 'antd-mobile';
import { AddOutline, DownFill } from 'antd-mobile-icons';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHouseholdCalendarQuery } from '@/entities/household';
import {
  HouseholdPageState,
  HouseholdRecordsPanel,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import styles from './index.module.scss';

function getInitialMonth(month: string | null) {
  return month && /^\d{4}-\d{2}-01$/.test(month) ? dayjs(month) : dayjs();
}

const HouseholdCalendarContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
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
  const dateMap = useMemo(
    () => new Map(calendarQuery.days.map(day => [day.date, day])),
    [calendarQuery.days],
  );
  const calendarRange = useMemo(() => ({
    max: selectMonthValue.endOf('month').toDate(),
    min: selectMonthValue.startOf('month').toDate(),
  }), [selectMonthValue]);
  const isToday = useCallback((date: Date | Dayjs) => {
    return dayjs().isSame(dayjs(date), 'day');
  }, []);
  const getDateText = useCallback((date: Date) => {
    return isToday(date) ? t('common:time.today') : dayjs(date).date();
  }, [isToday, t]);

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

  const handleSelectRecord = useCallback((record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  }, [household.id, navigate]);

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
      <NavBar
        back={t('common:nav.back')}
        right={<div onClick={handleToToday}>{t('common:time.today')}</div>}
        className="bg-primary flex-shrink-0 fixed top-0 left-0 w-full"
        onBack={() => navigate(-1)}
      >
        <div className="flex items-center justify-center space-x-2" onClick={handleDatePicker}>
          <span>{selectMonthValue.format('YYYY年MM月')}</span>
          <DownFill className="text-base" />
        </div>
      </NavBar>
      <CalendarPickerView
        {...calendarRange}
        allowClear={false}
        title={false}
        selectionMode="single"
        weekStartsOn="Monday"
        value={selectDateValue.toDate()}
        onChange={handleChangeDate}
        renderDate={(date) => {
          const data = dateMap.get(dayjs(date).format('YYYY-MM-DD'));
          return (
            <div
              className={classNames('flex-grow flex flex-col', {
                'border-[1px] border-solid border-gray-200 rounded-[2px]': isToday(date),
              })}
              data-date={dayjs(date).format('YYYY-MM-DD')}
            >
              <div className={classNames('mt-1 flex justify-center', {
                'text-sm': isToday(date),
              })}
              >
                {getDateText(date)}
              </div>
              <div className="flex-grow flex flex-col text-xs leading-[10px]">
                <div className="flex justify-center h-[10px] text-[#00863f]">
                  {!!Number(data?.visibleIncome) && (
                    <>
                      +
                      {Number(data?.visibleIncome)}
                    </>
                  )}
                </div>
                <div className="flex justify-center h-[10px] text-[#cf7179]">
                  {!!Number(data?.visibleExpense) && (
                    <>
                      -
                      {Number(data?.visibleExpense)}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      />
      <div className="h-1 bg-[#f6f7f8] flex-shrink-0" />
      <div className="pb-8">
        <HouseholdRecordsPanel
          dailyTotals={calendarQuery.days}
          emptyDescription={t('calendar.emptyDay')}
          filters={{ endDate: selectedDate, startDate: selectedDate }}
          householdId={household.id}
          isCompactGrouped
          onSelect={handleSelectRecord}
          showSummary={false}
        />
      </div>
      <FloatingBubble
        axis="xy"
        className="[--edge-distance:12px] [--initial-position-bottom:20%] [--initial-position-right:12px] [--size:55px]"
        magnetic="x"
        onClick={handleCreateRecord}
      >
        <AddOutline className="text-2xl text-[#333]" />
      </FloatingBubble>
    </HouseholdPageState>
  );
};

const HouseholdCalendarPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();

  return (
    <div
      className={classNames('page-new', styles['record-calendar-page'])}
      data-testid="household-calendar-page"
    >
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <HouseholdCalendarContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdCalendarPage;
