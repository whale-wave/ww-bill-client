import { ErrorBlock, FloatingBubble } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { RecordList } from '@/entities/record';
import { RecordCalendarView } from '@/features/record-workspace';
import { useTranslation } from '@/shared/i18n';
import { useRecordCalendar } from '../model/useRecordCalendar';

const RecordCalendar: React.FC = () => {
  const { t } = useTranslation('record');
  const {
    selectMonthValue,
    selectDateValue,
    dateMap,
    list,
    onBack,
    onDatePicker,
    onChangeDate,
    onToToday,
    onFixedPinClick,
  } = useRecordCalendar();
  const dayStats = useMemo(() => new Map(
    [...dateMap.entries()].map(([timestamp, stat]) => [
      dayjs(timestamp).format('YYYY-MM-DD'),
      {
        expense: stat.expend,
        hasRecords: stat.list.length > 0,
        income: stat.income,
      },
    ]),
  ), [dateMap]);

  return (
    <RecordCalendarView
      backLabel={t('common:nav.back')}
      dayStats={dayStats}
      floatingAction={(
        <FloatingBubble
          axis="xy"
          magnetic="x"
          onClick={onFixedPinClick}
          style={{
            '--edge-distance': '12px',
            '--initial-position-bottom': '20%',
            '--initial-position-right': '12px',
            '--size': '55px',
          }}
        >
          <AddOutline className="text-2xl text-[#333]" />
        </FloatingBubble>
      )}
      month={selectMonthValue.toDate()}
      monthTitle={selectMonthValue.format('YYYY年MM月')}
      onBack={onBack}
      onDateChange={date => onChangeDate(date)}
      onMonthClick={onDatePicker}
      onToday={onToToday}
      records={(
        <>
          <span className="hidden">{t('calendar.dailyBudget')}</span>
          {list.data.length > 0
            ? <RecordList data={list} />
            : (
                <div className="flex min-h-[220px] items-center justify-center">
                  <ErrorBlock description={false} status="empty" title={t('common:empty')} />
                </div>
              )}
        </>
      )}
      selectedDate={selectDateValue.toDate()}
      todayLabel={t('common:time.today')}
    />
  );
};

export default RecordCalendar;
