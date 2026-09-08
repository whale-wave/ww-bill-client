import type { Dayjs } from 'dayjs';
import type { FC, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { RecordOverviewListGroup, RecordOverviewListItem } from './RecordOverviewList';
import {
  Button,
  CalendarPickerView,
  ErrorBlock,
  SpinLoading,
} from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib';
import { IllustratedEmptyState, MOTION_PRESETS, useMotionPreference } from '@/shared/ui';
import { RecordMonthPicker } from './RecordMonthPicker';
import { RecordOverviewList } from './RecordOverviewList';

export interface RecordCalendarDay {
  date: string;
  expense?: ReactNode;
  income?: ReactNode;
}

export type RecordCalendarState = 'error' | 'loading' | 'ready';

const CALENDAR_SWIPE_MIN_DISTANCE = 48;
const CALENDAR_SWIPE_DIRECTION_RATIO = 1.25;
const CALENDAR_SWIPE_CLICK_GUARD_MS = 250;
const CALENDAR_MONTH_TRANSITION_DISTANCE = 28;

type CalendarMonthTransitionDirection = -1 | 0 | 1;

const calendarMonthTransitionVariants = {
  center: { opacity: 1, x: 0 },
  enter: (direction: CalendarMonthTransitionDirection) => ({
    opacity: 0.68,
    x: direction * CALENDAR_MONTH_TRANSITION_DISTANCE,
  }),
  exit: (direction: CalendarMonthTransitionDirection) => ({
    opacity: 0,
    x: direction * -CALENDAR_MONTH_TRANSITION_DISTANCE,
  }),
};

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
  recordCountLabel?: (count: number) => ReactNode;
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
  '[&_.adm-calendar-picker-view-cell]:h-[clamp(46px,6.6dvh,50px)]',
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
  '[&_.adm-calendar-picker-view-cell-selected]:!border-primary-mid',
  '[&_.adm-calendar-picker-view-cell-selected]:!bg-transparent',
  '[&_.adm-calendar-picker-view-cell-selected]:!text-inherit',
  '[&_.adm-calendar-picker-view-cell-selected]:!shadow-none',
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
  recordCountLabel,
  renderCategoryIcon,
  retryLabel,
  selectedDayLabel,
  selectedDate,
  state,
  todayLabel,
}) => {
  const swipeOriginRef = useRef<{ pointerId: number; x: number; y: number }>();
  const shouldSuppressClickRef = useRef(false);
  const clickGuardTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const monthTransitionDirectionRef = useRef<CalendarMonthTransitionDirection>(0);
  const { isMotionEnabled } = useMotionPreference();
  useEffect(() => () => {
    if (clickGuardTimerRef.current)
      clearTimeout(clickGuardTimerRef.current);
  }, []);
  const dayMap = new Map(days.map(day => [day.date, day]));
  const calendarRange = {
    max: month.endOf('month').toDate(),
    min: month.startOf('month').toDate(),
  };
  const isTodaySelected = selectedDate.isSame(dayjs(), 'day');
  const recordCount = groups.reduce((total, group) => total + group.records.length, 0);
  const monthKey = month.format('YYYY-MM');
  const monthTransitionDirection = monthTransitionDirectionRef.current;
  const monthTransitionDirectionLabel = monthTransitionDirection > 0
    ? 'forward'
    : monthTransitionDirection < 0 ? 'backward' : 'idle';

  const clearClickGuard = () => {
    if (clickGuardTimerRef.current)
      clearTimeout(clickGuardTimerRef.current);
    clickGuardTimerRef.current = undefined;
  };

  const releasePointerCapture = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      event.currentTarget.hasPointerCapture
      && event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleSwipeStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (!onMonthChange || event.button !== 0 || event.isPrimary === false)
      return;
    swipeOriginRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleSwipeCancel = (event: ReactPointerEvent<HTMLElement>) => {
    swipeOriginRef.current = undefined;
    releasePointerCapture(event);
  };

  const setMonthTransitionDirection = (nextMonth: Dayjs) => {
    const normalizedMonth = nextMonth.startOf('month');
    monthTransitionDirectionRef.current = normalizedMonth.isSame(month, 'month')
      ? 0
      : normalizedMonth.isAfter(month, 'month') ? 1 : -1;
    return normalizedMonth;
  };

  const handleMonthChangeRequest = (nextMonth: Dayjs) => {
    if (!onMonthChange)
      return;
    const normalizedMonth = setMonthTransitionDirection(nextMonth);
    onMonthChange(normalizedMonth);
  };

  const handleSwipeEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const origin = swipeOriginRef.current;
    swipeOriginRef.current = undefined;
    releasePointerCapture(event);
    if (!origin || origin.pointerId !== event.pointerId || !onMonthChange)
      return;

    const horizontalDistance = event.clientX - origin.x;
    const verticalDistance = event.clientY - origin.y;
    if (
      Math.abs(horizontalDistance) < CALENDAR_SWIPE_MIN_DISTANCE
      || Math.abs(horizontalDistance) < Math.abs(verticalDistance) * CALENDAR_SWIPE_DIRECTION_RATIO
    ) {
      return;
    }

    const nextMonth = month
      .add(horizontalDistance < 0 ? 1 : -1, 'month')
      .startOf('month');
    if (nextMonth.isAfter(dayjs(), 'month'))
      return;

    shouldSuppressClickRef.current = true;
    clearClickGuard();
    clickGuardTimerRef.current = setTimeout(() => {
      shouldSuppressClickRef.current = false;
      clickGuardTimerRef.current = undefined;
    }, CALENDAR_SWIPE_CLICK_GUARD_MS);
    handleMonthChangeRequest(nextMonth);
  };

  const handleCalendarClickCapture = (event: React.MouseEvent<HTMLElement>) => {
    if (!shouldSuppressClickRef.current)
      return;
    shouldSuppressClickRef.current = false;
    clearClickGuard();
    event.preventDefault();
    event.stopPropagation();
  };

  const handleToday = () => {
    setMonthTransitionDirection(dayjs());
    onToday();
  };

  return (
    <div
      className={calendarRootClassName}
      data-record-calendar-presentation
    >
      <header className="relative z-10 grid shrink-0 grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-2 px-[18px] pb-2 pt-[max(10px,env(safe-area-inset-top))]">
        <button
          aria-label={backLabel}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-solid border-white/70 bg-white/75 p-0 text-primary-dark shadow-ww-xs backdrop-blur-md transition active:scale-95"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        {onMonthChange
          ? (
              <RecordMonthPicker
                month={month}
                onChange={handleMonthChangeRequest}
                testId="record-calendar-month-picker"
                variant="calendar"
              />
            )
          : (
              <button
                className="mx-auto h-11 rounded-full border border-solid border-white/70 bg-white/70 px-4 font-number text-[16px] font-extrabold text-ww-ink shadow-ww-xs"
                onClick={onMonthClick}
                type="button"
              >
                {month.format('YYYY / MM')}
              </button>
            )}
        {isTodaySelected
          ? <span aria-hidden="true" className="h-11 w-12" data-record-calendar-today-placeholder />
          : (
              <button
                aria-label={todayLabel}
                className="flex h-11 w-12 items-center justify-center rounded-full border border-solid border-primary/15 bg-white/65 px-0 text-[12px] font-extrabold text-primary-dark shadow-ww-xs backdrop-blur-md transition active:scale-95 active:bg-primary-light/70"
                data-record-calendar-today
                onClick={handleToday}
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
                <section
                  className="mx-[18px] shrink-0 touch-pan-y overflow-hidden rounded-[24px] border border-solid border-white/80 bg-white/70 px-2 pb-2 pt-1 shadow-ww backdrop-blur-md"
                  data-record-calendar-swipe
                  onClickCapture={handleCalendarClickCapture}
                  onPointerCancel={handleSwipeCancel}
                  onPointerDown={handleSwipeStart}
                  onPointerUp={handleSwipeEnd}
                >
                  <AnimatePresence custom={monthTransitionDirection} initial={false} mode="popLayout">
                    <m.div
                      animate="center"
                      className="w-full"
                      custom={monthTransitionDirection}
                      data-month-transition-direction={monthTransitionDirectionLabel}
                      data-record-calendar-month={monthKey}
                      exit={isMotionEnabled ? 'exit' : undefined}
                      initial={isMotionEnabled ? 'enter' : false}
                      key={monthKey}
                      transition={MOTION_PRESETS.contentSwap.transition}
                      variants={calendarMonthTransitionVariants}
                    >
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
                                'flex flex-grow -translate-y-px flex-col items-center justify-center rounded-[11px]',
                                isToday && !isSelected && 'text-primary-deep',
                              )}
                              data-date={dateValue.format('YYYY-MM-DD')}
                            >
                              <div
                                className="flex h-5 w-6 items-center justify-center text-[13px] font-bold"
                                data-calendar-day-number
                              >
                                {dateValue.date()}
                              </div>
                              <div className="mt-px flex flex-col items-center gap-px text-[9px] font-semibold leading-[9px]">
                                <div className="flex min-h-[9px] justify-center text-finance-income">
                                  {day?.income
                                    ? (
                                        <>
                                          +
                                          {day.income}
                                        </>
                                      )
                                    : null}
                                </div>
                                <div className="flex min-h-[9px] justify-center text-finance-expense">
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
                    </m.div>
                  </AnimatePresence>
                </section>
                <m.div
                  animate={isMotionEnabled ? MOTION_PRESETS.contentSwap.animate : undefined}
                  className="flex min-h-0 flex-grow shrink-0 flex-col"
                  data-record-calendar-month-details={monthKey}
                  initial={isMotionEnabled ? MOTION_PRESETS.contentSwap.initial : false}
                  key={`details-${monthKey}`}
                  transition={MOTION_PRESETS.contentSwap.transition}
                >
                  <div className="flex shrink-0 items-center justify-between px-[22px] pb-2 pt-4">
                    <p className="text-[15px] font-extrabold text-ww-ink">{selectedDayLabel ?? emptyLabel}</p>
                    {recordCount > 0 && (
                      <span className="rounded-full bg-primary-light/60 px-3 py-1 text-[11px] font-bold text-primary-dark">
                        {recordCountLabel?.(recordCount) ?? `共 ${recordCount} 笔`}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'mx-[18px] min-h-[220px] flex-grow shrink-0',
                      groups.length === 0 && 'overflow-hidden rounded-[22px] border border-solid border-white/75 bg-white/58 pb-3 shadow-ww-xs backdrop-blur-md',
                    )}
                    data-record-calendar-list
                  >
                    {groups.length > 0
                      ? <RecordOverviewList groups={groups} renderCategoryIcon={renderCategoryIcon} variant="overview" />
                      : (
                          <IllustratedEmptyState
                            className="min-h-[210px] py-5 [&>div]:mb-3 [&>div]:scale-75"
                            description={emptyDescription}
                            icon={<CalendarDays className="text-primary-dark" size={36} strokeWidth={1.8} />}
                            title={emptyLabel}
                          />
                        )}
                  </div>
                </m.div>
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
