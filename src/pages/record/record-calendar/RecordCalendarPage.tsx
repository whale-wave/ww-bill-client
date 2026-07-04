import type { Dayjs } from 'dayjs';
import type { RecordEntry } from '@/entities/record';
import { CalendarPickerView, DatePicker, ErrorBlock, FloatingBubble, NavBar } from 'antd-mobile';
import { AddOutline, DownFill } from 'antd-mobile-icons';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RecordList, useGetRecordQuery } from '@/entities/record';
import { math } from '@/shared/lib';
import styles from './index.module.scss';

interface RecordCalendarProps {
}

const RecordCalendar: React.FC<RecordCalendarProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectTime = searchParams.get('selectTime');

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
  }, [selectMonthValue]);

  const onChangeDate = useCallback((date: Date | null) => {
    setSelectDateValue(dayjs(date));
  }, []);

  const onToToday = useCallback(() => {
    if (isToday(selectDateValue))
      return;

    setSelectMonthValue(dayjs());
    setSelectDateValue(dayjs());
  }, [selectDateValue]);

  const onFixedPinClick = useCallback(() => {
    const url = `/bookkeeping?selectTime=${selectDateValue.valueOf()}`;
    navigate(url, { replace: true });
  }, [selectDateValue]);

  return (
    <div className={classNames('page-new pt-[45px]', styles['record-calendar-page'])}>
      <NavBar
        back="返回"
        right={<div onClick={onToToday}>今天</div>}
        className="bg-primary flex-shrink-0 fixed top-0 left-0 w-full"
        onBack={onBack}
      >
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
        {list.data.length > 0 ? <RecordList data={list} /> : <div className="flex-grow flex justify-center items-center"><ErrorBlock status="empty" title="暂无数据" description={false} /></div>}
      </div>
      <FloatingBubble
        style={{
          '--initial-position-bottom': '20%',
          '--initial-position-right': '12px',
          '--edge-distance': '12px',
          '--size': '55px',
        }}
        axis="xy"
        magnetic="x"
        onClick={onFixedPinClick}
      >
        <AddOutline className="text-[30px] text-[#333]" />
      </FloatingBubble>
    </div>
  );
};

export default RecordCalendar;
