import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import type { RecordOverviewListGroup } from './RecordOverviewList';
import {
  Button,
  CalendarPickerView,
  ErrorBlock,
  FloatingBubble,
  NavBar,
  SpinLoading,
} from 'antd-mobile';
import { AddOutline, DownFill } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { cn } from '@/shared/lib';
import { RecordOverviewList } from './RecordOverviewList';

export interface RecordCalendarDay {
  date: string;
  expense?: ReactNode;
  income?: ReactNode;
}

export type RecordCalendarState = 'error' | 'loading' | 'ready';

interface RecordCalendarPresentationProps {
  backLabel: string;
  canCreate?: boolean;
  days: RecordCalendarDay[];
  emptyLabel: ReactNode;
  errorDescription?: ReactNode;
  groups: RecordOverviewListGroup[];
  month: Dayjs;
  onBack: () => void;
  onCreate?: () => void;
  onDateChange: (date: Dayjs) => void;
  onMonthClick: () => void;
  onRetry?: () => void;
  onToday: () => void;
  retryLabel?: ReactNode;
  selectedDate: Dayjs;
  state: RecordCalendarState;
  todayLabel: string;
}

const calendarRootClassName = [
  'page-new',
  '[&_.adm-calendar-picker-view-title]:hidden',
  '[&_.adm-calendar-picker-view-header]:hidden',
  '[&_.adm-calendar-picker-view-cell-top]:hidden',
  '[&_.adm-calendar-picker-view-cell-bottom]:hidden',
  '[&_.adm-calendar-picker-view-mark]:border-b-0',
  '[&_.adm-calendar-picker-view-mark]:text-gray96',
  '[&_.adm-calendar-picker-view-body]:h-[unset]',
  '[&_.adm-calendar-picker-view-cell]:h-[56px]',
  '[&_.adm-calendar-picker-view-cell]:w-[calc(100%/7-24px/7)]',
  '[&_.adm-calendar-picker-view-cell]:rounded-[2px]',
  '[&_.adm-calendar-picker-view-cell]:border',
  '[&_.adm-calendar-picker-view-cell]:border-solid',
  '[&_.adm-calendar-picker-view-cell]:border-transparent',
  '[&_.adm-calendar-picker-view-cell]:p-0',
  '[&_.adm-calendar-picker-view-cell]:text-inherit',
  '[&_.adm-calendar-picker-view-cell:not(:nth-child(7n))]:mr-[4px]',
  '[&_.adm-calendar-picker-view-cell-selected]:border-black333',
  '[&_.adm-calendar-picker-view-cell-selected]:bg-transparent',
  '[&_.adm-calendar-picker-view-cell-selected]:text-inherit',
  '[&_.adm-calendar-picker-view-cell-date]:flex',
  '[&_.adm-calendar-picker-view-cell-date]:h-full',
  '[&_.adm-calendar-picker-view-cell-date]:w-full',
  '[&_.adm-calendar-picker-view-cell-date]:flex-grow',
  '[&_.adm-calendar-picker-view-cell-date]:text-base',
].join(' ');

export const RecordCalendarPresentation: FC<RecordCalendarPresentationProps> = ({
  backLabel,
  canCreate = true,
  days,
  emptyLabel,
  errorDescription,
  groups,
  month,
  onBack,
  onCreate,
  onDateChange,
  onMonthClick,
  onRetry,
  onToday,
  retryLabel,
  selectedDate,
  state,
  todayLabel,
}) => {
  const dayMap = new Map(days.map(day => [day.date, day]));
  const calendarRange = {
    max: month.endOf('month').toDate(),
    min: month.startOf('month').toDate(),
  };

  return (
    <div
      className={calendarRootClassName}
      data-record-calendar-presentation
    >
      <NavBar
        back={backLabel}
        className="fixed left-0 top-0 z-10 w-full flex-shrink-0 bg-primary"
        onBack={onBack}
        right={<button className="border-0 bg-transparent" onClick={onToday} type="button">{todayLabel}</button>}
      >
        <div
          className="flex items-center justify-center space-x-2 border-0 bg-transparent"
          onClick={onMonthClick}
        >
          <span>{month.format('YYYY年MM月')}</span>
          <DownFill className="text-base" />
        </div>
      </NavBar>

      {state === 'loading'
        ? (
            <div className="flex flex-grow items-center justify-center" data-record-calendar-state="loading">
              <SpinLoading />
            </div>
          )
        : state === 'error'
          ? (
              <div className="flex flex-grow flex-col items-center justify-center" data-record-calendar-state="error">
                <ErrorBlock description={errorDescription} />
                {onRetry && <Button className="mt-3" onClick={onRetry} size="small">{retryLabel}</Button>}
              </div>
            )
          : (
              <>
                <CalendarPickerView
                  {...calendarRange}
                  allowClear={false}
                  onChange={(date) => {
                    if (date)
                      onDateChange(dayjs(date));
                  }}
                  renderDate={(date) => {
                    const dateValue = dayjs(date);
                    const day = dayMap.get(dateValue.format('YYYY-MM-DD'));
                    const isToday = dayjs().isSame(dateValue, 'day');
                    return (
                      <div
                        className={cn(
                          'flex flex-grow flex-col',
                          isToday && 'rounded-[2px] border border-solid border-gray-200',
                        )}
                        data-date={dateValue.format('YYYY-MM-DD')}
                      >
                        <div className={cn('mt-1 flex justify-center', isToday && 'text-sm')}>
                          {isToday ? todayLabel : dateValue.date()}
                        </div>
                        <div className="flex flex-grow flex-col text-xs leading-[10px]">
                          <div className="flex h-[10px] justify-center text-[#00863f]">
                            {day?.income
                              ? (
                                  <>
                                    +
                                    {day.income}
                                  </>
                                )
                              : null}
                          </div>
                          <div className="flex h-[10px] justify-center text-[#cf7179]">
                            {day?.expense
                              ? (
                                  <>
                                    -
                                    {day.expense}
                                  </>
                                )
                              : null}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  selectionMode="single"
                  title={false}
                  value={selectedDate.toDate()}
                  weekStartsOn="Monday"
                />
                <div className="h-1 flex-shrink-0 bg-[#f6f7f8]" />
                <div className="min-h-0 flex-grow overflow-auto pb-8">
                  {groups.length > 0
                    ? <RecordOverviewList groups={groups} variant="search" />
                    : (
                        <div className="flex min-h-[180px] flex-grow items-center justify-center">
                          <ErrorBlock description={false} status="empty" title={emptyLabel} />
                        </div>
                      )}
                </div>
              </>
            )}

      {state === 'ready' && canCreate && onCreate && (
        <FloatingBubble
          axis="xy"
          className="[--edge-distance:12px] [--initial-position-bottom:20%] [--initial-position-right:12px] [--size:55px]"
          data-record-calendar-create
          magnetic="x"
          onClick={onCreate}
        >
          <AddOutline className="text-2xl text-[#333]" />
        </FloatingBubble>
      )}
    </div>
  );
};
