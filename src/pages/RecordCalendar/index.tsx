import React, { useCallback, useMemo, useState } from 'react';
import { CalendarPickerView, DatePicker, NavBar } from 'antd-mobile';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DownFill } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useGetRecordQuery } from '@/hooks';
import type { RecordEntry } from '@/api';
import { math } from '@/utils';
import RecordItemGroup from '@/pages/SearchRecord/components/RecordItemGroup.tsx';

interface RecordCalendarProps {
}

const RecordCalendar: React.FC<RecordCalendarProps> = () => {
  const navigate = useNavigate();

  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(dayjs());
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(dayjs());

  const { data: recordList } = useGetRecordQuery({
    params: { startDate: selectMonthValue.format('YYYY-MM-DD') },
  });

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
        data.expend = math.subtract(data.expend, record.amount).toNumber();
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

  const isToday = useCallback((date: Date) => {
    const todayDate = dayjs().startOf('day').valueOf();
    const dateValue = dayjs(date).startOf('day').valueOf();

    return dateValue === todayDate;
  }, []);

  const getDateText = useCallback((date: Date) => {
    const dateValue = dayjs(date).date();

    return isToday(date) ? '今天' : dateValue;
  }, []);

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  const onDatePicker = useCallback(() => {
    void DatePicker.prompt({
      title: '选择月份',
      precision: 'month',
      defaultValue: selectMonthValue.toDate(),
      onConfirm: (val) => {
        setSelectMonthValue(dayjs(val));
        if (dayjs(val).startOf('month').isSame(dayjs().startOf('month'))) {
          setSelectDateValue(dayjs());
        }
        else {
          setSelectDateValue(dayjs(val).startOf('day'));
        }
      },
    });
  }, [selectMonthValue]);

  const onChangeDate = useCallback((date: Date | null) => {
    setSelectDateValue(dayjs(date));
  }, []);

  const onToToday = useCallback(() => {
    setSelectMonthValue(dayjs());
    setSelectDateValue(dayjs());
  }, []);

  return (
    <div className={classNames('page-new pt-[45px]', styles['record-calendar-page'])}>
      <NavBar back="返回" right={<div onClick={onToToday}>今天</div>} className="bg-primary flex-shrink-0 fixed top-0 left-0 w-full" onBack={onBack}>
        <div className="flex items-center justify-center space-x-2" onClick={onDatePicker}>
          <span>{selectMonthValue.format('YYYY年MM月')}</span>
          <DownFill className="text-[14px]" />
        </div>
      </NavBar>
      <CalendarPickerView
        {...calendarRange}
        allowClear={false}
        title={false}
        selectionMode="single"
        weekStartsOn="Monday"
        value={selectDateValue.toDate()}
        onChange={onChangeDate}
        renderDate={(date) => {
          const data = dateMap.get(dayjs(date).startOf('day').valueOf());
          return (
            <div className={classNames('flex-grow flex flex-col', {
              'border-[1px] border-solid border-gray-200 rounded-[2px]': isToday(date),
            })}
            >
              <div className={classNames('mt-1 flex justify-center', {
                'text-[12px]': isToday(date),
              })}
              >
                {getDateText(date)}
              </div>
              <div className="flex-grow flex flex-col text-[10px] leading-[10px]">
                <div className="flex justify-center h-[10px] text-[#00863f]">
                  {!!data?.income && (
                    <>
                      +
                      {data.income}
                    </>
                  )}
                </div>
                <div className="flex justify-center h-[10px] text-[#cf7179]">
                  {!!data?.expend && (
                    <>
                      -
                      {data.expend}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      />
      <div className="hidden">
        日均预算
      </div>
      <div className="h-1 bg-[#f6f7f8] flex-shrink-0" />
      <div className="pb-8">
        {list.data.length > 0 && <RecordItemGroup data={list} />}
      </div>
    </div>
  );
};

export default RecordCalendar;
