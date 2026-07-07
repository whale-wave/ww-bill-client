import type { Dayjs } from 'dayjs';
import type { RecordEntry } from '@/entities/record';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetRecordQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';

export function useRecordCalendar() {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectTime = searchParams.get('bookkeeping.selectTime');

  const defaultSelectTime = selectTime ? dayjs(Number(selectTime)) : undefined;
  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(defaultSelectTime || dayjs());
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(defaultSelectTime || dayjs());

  const params = useMemo(() => {
    return { startDate: selectMonthValue.format('YYYY-MM-DD') };
  }, [selectMonthValue]);

  const { data: recordList } = useGetRecordQuery({ params });

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
  }, []);

  const onDatePicker = useCallback(() => {
    void DatePicker.prompt({
      title: t('record:calendar.selectMonth'),
      precision: 'month',
      defaultValue: selectMonthValue.toDate(),
      onConfirm: (val) => {
        if (selectMonthValue.isSame(dayjs(val), 'month'))
          return;
        setSelectMonthValue(dayjs(val));
        if (dayjs().isSame(dayjs(val), 'month')) {
          setSelectDateValue(dayjs());
        }
        else {
          setSelectDateValue(dayjs(val).startOf('day'));
        }
      },
    });
  }, [selectMonthValue, t]);

  const onChangeDate = useCallback((date: Date | null) => {
    setSelectDateValue(dayjs(date));
  }, []);

  const onToToday = useCallback(() => {
    if (isToday(selectDateValue))
      return;
    setSelectMonthValue(dayjs());
    setSelectDateValue(dayjs());
  }, [selectDateValue, isToday]);

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
    onDatePicker,
    onChangeDate,
    onToToday,
    onFixedPinClick,
  };
}
