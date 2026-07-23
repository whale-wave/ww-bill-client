import type { FC, ReactNode } from 'react';
import { CalendarPickerView, NavBar } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './record-calendar-view.module.scss';

export interface RecordCalendarDayStat {
  expense?: string | number;
  hasRecords?: boolean;
  income?: string | number;
}

interface RecordCalendarViewProps {
  backLabel: string;
  dayStats: Map<string, RecordCalendarDayStat>;
  floatingAction?: ReactNode;
  month: Date;
  monthTitle: string;
  onBack: () => void;
  onDateChange: (date: Date) => void;
  onMonthClick: () => void;
  onToday: () => void;
  records: ReactNode;
  selectedDate: Date;
  todayLabel: string;
}

export const RecordCalendarView: FC<RecordCalendarViewProps> = ({
  dayStats,
  backLabel,
  floatingAction,
  month,
  monthTitle,
  onBack,
  onDateChange,
  onMonthClick,
  onToday,
  records,
  selectedDate,
  todayLabel,
}) => (
  <div className={classNames('page-new bg-white', styles.page)}>
    <NavBar
      back={backLabel}
      className="flex-shrink-0 bg-primary"
      onBack={onBack}
      right={<button className="border-0 bg-transparent" onClick={onToday} type="button">{todayLabel}</button>}
    >
      <button
        className="inline-flex items-center gap-2 border-0 bg-transparent text-lg"
        onClick={onMonthClick}
        type="button"
      >
        <span>{monthTitle}</span>
        <DownFill className="text-sm" />
      </button>
    </NavBar>
    <CalendarPickerView
      allowClear={false}
      max={dayjs(month).endOf('month').toDate()}
      min={dayjs(month).startOf('month').toDate()}
      onChange={date => date && onDateChange(date)}
      renderDate={(date) => {
        const stat = dayStats.get(dayjs(date).format('YYYY-MM-DD'));
        return (
          <div
            className="flex h-full flex-grow flex-col items-center justify-center"
            data-date={dayjs(date).format('YYYY-MM-DD')}
          >
            <span>{dayjs(date).date()}</span>
            {stat?.hasRecords && <span className="mt-1 h-1 w-1 rounded-full bg-[#c7c7c7]" />}
          </div>
        );
      }}
      selectionMode="single"
      title={false}
      value={selectedDate}
      weekStartsOn="Monday"
    />
    <div className="min-h-0 flex-grow overflow-auto bg-white">{records}</div>
    {floatingAction}
  </div>
);
