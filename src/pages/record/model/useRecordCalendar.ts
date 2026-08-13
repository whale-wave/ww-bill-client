import type { Dayjs } from 'dayjs';
import type { RecordEntry } from '@/entities/record';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetRecordQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';

export function useRecordCalendar() {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacySelectTime = searchParams.get('bookkeeping.selectTime');
  const selectTime = searchParams.get('selectTime') ?? legacySelectTime;

  const defaultSelectTime = selectTime ? dayjs(Number(selectTime)) : undefined;
  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(() => defaultSelectTime || dayjs());
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(() => defaultSelectTime || dayjs());

  const params = useMemo(() => {
    return { startDate: selectMonthValue.format('YYYY-MM-DD') };
  }, [selectMonthValue]);

  const recordQuery = useGetRecordQuery({ params });
  const recordList = recordQuery.data;

  useEffect(() => {
    if (!legacySelectTime || searchParams.has('selectTime'))
      return;
    const next = new URLSearchParams(searchParams);
    next.set('selectTime', legacySelectTime);
    next.delete('bookkeeping.selectTime');
    setSearchParams(next, { replace: true });
  }, [legacySelectTime, searchParams, setSearchParams]);

  const syncSelectedDate = useCallback((date: Dayjs) => {
    const next = new URLSearchParams(searchParams);
    next.set('selectTime', String(date.valueOf()));
    next.delete('bookkeeping.selectTime');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const dateMap = useMemo(() => {
    const map = new Map<number, {
      list: RecordEntry[];
      expend: number;
      income: number;
    }>();

    if (!recordList)
      return map;

    recordList.data.forEach((record) => {
      const date = dayjs(record.time).startOf('day').valueOf();

      let data = map.get(date);
      if (!data) {
        data = {
          list: [record],
          expend: 0,
          income: 0,
        };

        map.set(date, data);
      }
      else {
        data.list.push(record);
      }

      if (record.type === 'sub') {
        data.expend = math.add(data.expend, record.amount).toNumber();
      }
      else {
        data.income = math.add(data.income, record.amount).toNumber();
      }
    });

    return map;
  }, [recordList]);

  const list = useMemo(() => {
    const data = dateMap.get(dayjs(selectDateValue).startOf('day').valueOf());

    if (data?.list) {
      return {
        data: data.list,
        time: selectDateValue.valueOf(),
      };
    }
    return {
      data: [],
      time: dayjs().valueOf(),
    };
  }, [dateMap, selectDateValue]);

  const calendarRange = useMemo(() => {
    return {
      min: selectMonthValue.startOf('month').toDate(),
      max: selectMonthValue.endOf('month').toDate(),
    };
  }, [selectMonthValue]);

  const isToday = useCallback((date: Date | Dayjs) => {
    return dayjs().isSame(dayjs(date), 'day');
  }, []);

  const getDateText = useCallback((date: Date) => {
    const dateValue = dayjs(date).date();
    return isToday(date) ? t('common:time.today') : dateValue;
  }, [t, isToday]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMonthChange = useCallback((month: Dayjs) => {
    if (selectMonthValue.isSame(month, 'month'))
      return;
    const nextMonth = month.startOf('month');
    const nextDate = dayjs().isSame(nextMonth, 'month') ? dayjs() : nextMonth;
    setSelectMonthValue(nextMonth);
    setSelectDateValue(nextDate);
    syncSelectedDate(nextDate);
  }, [selectMonthValue, syncSelectedDate]);

  const onChangeDate = useCallback((date: Date | null) => {
    const nextDate = dayjs(date);
    setSelectDateValue(nextDate);
    syncSelectedDate(nextDate);
  }, [syncSelectedDate]);

  const onToToday = useCallback(() => {
    if (isToday(selectDateValue))
      return;
    setSelectMonthValue(dayjs());
    setSelectDateValue(dayjs());
    syncSelectedDate(dayjs());
  }, [selectDateValue, isToday, syncSelectedDate]);

  const onFixedPinClick = useCallback(() => {
    const url = `/bookkeeping?selectTime=${selectDateValue.valueOf()}`;
    navigate(url, { replace: true });
  }, [selectDateValue, navigate]);

  return {
    selectMonthValue,
    selectDateValue,
    dateMap,
    list,
    calendarRange,
    isToday,
    getDateText,
    onBack,
    onMonthChange,
    onChangeDate,
    onToToday,
    onFixedPinClick,
    isError: recordQuery.isError,
    isLoading: recordQuery.isLoading,
    refetch: recordQuery.refetch,
  };
}
