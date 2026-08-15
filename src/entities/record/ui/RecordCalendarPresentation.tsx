import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import type { RecordOverviewListGroup, RecordOverviewListItem } from './RecordOverviewList';
import {
  Button,
  CalendarPickerView,
  ErrorBlock,
  SpinLoading,
} from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react';
import { cn } from '@/shared/lib';
import { IllustratedEmptyState } from '@/shared/ui';
import { RecordMonthPicker } from './RecordMonthPicker';
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
  emptyDescription?: ReactNode;
  emptyLabel: ReactNode;
  errorDescription?: ReactNode;
  groups: RecordOverviewListGroup[];
  month: Dayjs;
  onBack: () => void;
  onCreate?: () => void;
  onDateChange: (date: Dayjs) => void;
  onMonthChange?: (month: Dayjs) => void;
  onMonthClick?: () => void;
  onRetry?: () => void;
  onToday: () => void;
  renderCategoryIcon?: (item: Pick<RecordOverviewListItem, 'categoryName' | 'iconName'>) => ReactNode;
  retryLabel?: ReactNode;
  selectedDayLabel?: ReactNode;
  selectedDate: Dayjs;
  state: RecordCalendarState;
  todayLabel: string;
}

const calendarRootClassName = [
  'page-new',
  'h-full',
  'max-h-[100dvh]',
  'min-h-0',
  'overflow-hidden',
  '[&_.adm-calendar-picker-view-title]:hidden',
  '[&_.adm-calendar-picker-view-header]:hidden',
  '[&_.adm-calendar-picker-view-cell-top]:hidden',
  '[&_.adm-calendar-picker-view-cell-bottom]:hidden',
  '[&_.adm-calendar-picker-view-mark]:border-b-0',
  '[&_.adm-calendar-picker-view-mark]:mb-1',
  '[&_.adm-calendar-picker-view-mark]:text-[11px]',
  '[&_.adm-calendar-picker-view-mark]:font-bold',
  '[&_.adm-calendar-picker-view-mark]:text-ww-soft',
  '[&_.adm-calendar-picker-view-body]:h-[unset]',
  '[&_.adm-calendar-picker-view-cell]:h-[clamp(40px,6.4dvh,48px)]',
  '[&_.adm-calendar-picker-view-cell]:min-h-0',
  '[&_.adm-calendar-picker-view-cell]:mb-[3px]',
  '[&_.adm-calendar-picker-view-cell]:w-[calc(100%/7-24px/7)]',
  '[&_.adm-calendar-picker-view-cell]:rounded-[13px]',
  '[&_.adm-calendar-picker-view-cell]:border',
  '[&_.adm-calendar-picker-view-cell]:border-solid',
  '[&_.adm-calendar-picker-view-cell]:border-transparent',
  '[&_.adm-calendar-picker-view-cell]:p-0',
  '[&_.adm-calendar-picker-view-cell]:text-inherit',
  '[&_.adm-calendar-picker-view-cell:not(:nth-child(7n))]:mr-[4px]',
  '[&_.adm-calendar-picker-view-cell-selected]:border-primary/45',
  '[&_.adm-calendar-picker-view-cell-selected]:bg-white',
  '[&_.adm-calendar-picker-view-cell-selected]:text-primary-dark',
  '[&_.adm-calendar-picker-view-cell-selected]:shadow-ww-xs',
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
  emptyDescription,
  emptyLabel,
  errorDescription,
  groups,
  month,
  onBack,
  onCreate,
  onDateChange,
  onMonthChange,
  onMonthClick,
  onRetry,
  onToday,
  renderCategoryIcon,
  retryLabel,
  selectedDayLabel,
  selectedDate,
  state,
  todayLabel,
}) => {
  const dayMap = new Map(days.map(day => [day.date, day]));
  const calendarRange = {
    max: month.endOf('month').toDate(),
    min: month.startOf('month').toDate(),
  };
  const isTodaySelected = selectedDate.isSame(dayjs(), 'day');

  return (
    <div
      className={calendarRootClassName}
      data-record-calendar-presentation
    >
      <header className="relative z-10 grid shrink-0 grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-2 px-[18px] pb-2 pt-[max(10px,env(safe-area-inset-top))]">
        <button
          aria-label={backLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-white/70 bg-white/75 p-0 text-primary-dark shadow-ww-xs backdrop-blur-md transition active:scale-95"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        {onMonthChange
          ? (
              <RecordMonthPicker
                month={month}
                onChange={onMonthChange}
                testId="record-calendar-month-picker"
                variant="calendar"
              />
            )
          : (
              <button
                className="mx-auto h-10 rounded-full border border-solid border-white/70 bg-white/70 px-4 font-number text-[16px] font-extrabold text-ww-ink shadow-ww-xs"
                onClick={onMonthClick}
                type="button"
              >
                {month.format('YYYY / MM')}
              </button>
            )}
        {isTodaySelected
          ? <span aria-hidden="true" className="h-9 w-12" data-record-calendar-today-placeholder />
          : (
              <button
                aria-label={todayLabel}
                className="flex h-9 w-12 items-center justify-center rounded-full border border-solid border-primary/15 bg-white/65 px-0 text-[12px] font-extrabold text-primary-dark shadow-ww-xs backdrop-blur-md transition active:scale-95 active:bg-primary-light/70"
                data-record-calendar-today
                onClick={onToday}
                title={todayLabel}
                type="button"
              >
                {todayLabel}
              </button>
            )}
      </header>

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
              <div
                className="flex min-h-0 flex-grow flex-col overflow-y-auto overscroll-y-contain pb-[max(84px,env(safe-area-inset-bottom))]"
                data-record-calendar-scroll
              >
                <section className="mx-[18px] shrink-0 rounded-[24px] border border-solid border-white/80 bg-white/70 px-2 pb-2 pt-1 shadow-ww backdrop-blur-md">
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
                      const isSelected = selectedDate.isSame(dateValue, 'day');
                      return (
                        <div
                          className={cn(
                            'flex flex-grow flex-col rounded-[11px] py-0.5',
                            isToday && !isSelected && 'bg-primary-light/45 text-primary-dark',
                          )}
                          data-date={dateValue.format('YYYY-MM-DD')}
                        >
                          <div className="mt-0.5 flex h-5 items-center justify-center text-[13px] font-bold">
                            {dateValue.date()}
                          </div>
                          <div className="flex flex-grow flex-col text-[9px] font-semibold leading-[9px]">
                            <div className="flex h-[9px] justify-center text-[#36a777]">
                              {day?.income
                                ? (
                                    <>
                                      +
                                      {day.income}
                                    </>
                                  )
                                : null}
                            </div>
                            <div className="flex h-[9px] justify-center text-[#d47a84]">
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
                </section>
                <div className="flex shrink-0 items-center justify-between px-[22px] pb-2 pt-4">
                  <div>
                    <p className="text-[15px] font-extrabold text-ww-ink">{selectedDayLabel ?? emptyLabel}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-ww-soft">{selectedDate.format('YYYY.MM.DD')}</p>
                  </div>
                  {groups.length > 0 && (
                    <span className="rounded-full bg-primary-light/60 px-3 py-1 text-[11px] font-bold text-primary-dark">
                      {groups.reduce((total, group) => total + group.records.length, 0)}
                    </span>
                  )}
                </div>
                <div className="mx-[18px] min-h-[220px] flex-grow shrink-0 overflow-hidden rounded-[22px] border border-solid border-white/75 bg-white/58 pb-3 shadow-ww-xs backdrop-blur-md">
                  {groups.length > 0
                    ? <RecordOverviewList groups={groups} renderCategoryIcon={renderCategoryIcon} variant="search" />
                    : (
                        <IllustratedEmptyState
                          className="min-h-[210px] py-5 [&>div]:mb-3 [&>div]:scale-75"
                          description={emptyDescription}
                          icon={<CalendarDays className="text-primary-dark" size={36} strokeWidth={1.8} />}
                          title={emptyLabel}
                        />
                      )}
                </div>
              </div>
            )}

      {state === 'ready' && canCreate && onCreate && (
        <button
          aria-label={String(selectedDayLabel ?? emptyLabel)}
          className="adm-floating-bubble-button fixed bottom-[max(20px,env(safe-area-inset-bottom))] right-[18px] z-20 flex h-14 w-14 items-center justify-center rounded-full border border-solid border-white/80 bg-primary text-white shadow-ww-lg transition active:scale-95"
          data-record-calendar-create
          onClick={onCreate}
          type="button"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
