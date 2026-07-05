import { CalendarPickerView, ErrorBlock, FloatingBubble, NavBar } from 'antd-mobile';
import { AddOutline, DownFill } from 'antd-mobile-icons';
import classNames from 'classnames';
import React from 'react';
import { RecordList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { useRecordCalendar } from '../model/useRecordCalendar';
import styles from './index.module.scss';

interface RecordCalendarProps {
}

const RecordCalendar: React.FC<RecordCalendarProps> = () => {
  const { t } = useTranslation('record');
  const {
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
  } = useRecordCalendar();

  return (
    <div className={classNames('page-new pt-[45px]', styles['record-calendar-page'])}>
      <NavBar
        back={t('common:nav.back')}
        right={<div onClick={onToToday}>{t('common:today')}</div>}
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
        {list.data.length > 0 ? <RecordList data={list} /> : <div className="flex-grow flex justify-center items-center"><ErrorBlock status="empty" title={t('common:empty')} description={false} /></div>}
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
