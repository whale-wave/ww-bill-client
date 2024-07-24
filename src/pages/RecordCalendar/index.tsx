import React, { useCallback, useMemo, useState } from 'react';
import { CalendarPickerView, DatePicker, NavBar } from 'antd-mobile';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DownFill } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './index.module.scss';

interface RecordCalendarProps {
}

const RecordCalendar: React.FC<RecordCalendarProps> = () => {
  const navigate = useNavigate();

  const record = [];

  const [selectMonthValue, setSelectMonthValue] = useState<Dayjs>(dayjs());
  const [selectDateValue, setSelectDateValue] = useState<Dayjs>(dayjs());
  const dateMap = useMemo(() => {
    const map = new Map<number, number>([[1721664000000, 400]]);
    return map;
  }, [record]);

  const calendarRange = useMemo(() => {
    return {
      min: selectMonthValue.startOf('month').toDate(),
      max: selectMonthValue.endOf('month').toDate(),
    };
  }, [selectMonthValue]);

  const isToday = useCallback((date: Date) => {
    const todayDate = dayjs().date();
    const dateValue = dayjs(date).date();

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
    <div className={classNames('page-new', styles['record-calendar-page'])}>
      <NavBar back="返回" right={<div onClick={onToToday}>今天</div>} className="bg-primary" onBack={onBack}>
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
          const value = dateMap.get(dayjs(date).startOf('day').valueOf());
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
                  +
                  {value}
                </div>
                <div className="flex justify-center h-[10px] text-[#cf7179]">
                  -
                  {value}
                </div>
              </div>
            </div>
          );
        }}
      />

    </div>
  );
};

export default RecordCalendar;
