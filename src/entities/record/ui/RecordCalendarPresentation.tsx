import type { Dayjs } from 'dayjs';
import type { FC, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { RecordOverviewListGroup, RecordOverviewListItem } from './RecordOverviewList';
import {
  Button,
  ErrorBlock,
  SpinLoading,
} from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { IllustratedEmptyState, MOTION_PRESETS, Surface, useMotionPreference } from '@/shared/ui';
import {
  CALENDAR_SWIPE_DIRECTION_RATIO,
  CALENDAR_SWIPE_MIN_DISTANCE,
  getCalendarWeekStart,
} from './record-calendar-motion';
import { RecordCalendarCarousel } from './RecordCalendarCarousel';
import { RecordMonthPicker } from './RecordMonthPicker';
import { RecordOverviewList } from './RecordOverviewList';

export interface RecordCalendarDay {
  date: string;
  expense?: ReactNode;
  income?: ReactNode;
}

export type RecordCalendarState = 'error' | 'loading' | 'ready';

const CALENDAR_SWIPE_CLICK_GUARD_MS = 250;

interface RecordCalendarPresentationProps {
  backLabel: string;
  canCreate?: boolean;
  collapseCalendarLabel: string;
  days: RecordCalendarDay[];
  emptyDescription?: ReactNode;
  emptyLabel: ReactNode;
  errorDescription?: ReactNode;
  expandCalendarLabel: string;
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

const calendarRootClassName = 'page-new h-full max-h-[100dvh] min-h-0 overflow-hidden';

export const RecordCalendarPresentation: FC<RecordCalendarPresentationProps> = ({
  backLabel,
  canCreate = true,
  collapseCalendarLabel,
  days,
  emptyDescription,
  emptyLabel,
  errorDescription,
  expandCalendarLabel,
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
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const { isMotionEnabled } = useMotionPreference();
  useEffect(() => () => {
    if (clickGuardTimerRef.current)
      clearTimeout(clickGuardTimerRef.current);
  }, []);
  const isTodaySelected = selectedDate.isSame(dayjs(), 'day');
  const recordCount = groups.reduce((total, group) => total + group.records.length, 0);
  const monthKey = month.format('YYYY-MM');

  const clearClickGuard = () => {
    if (clickGuardTimerRef.current)
      clearTimeout(clickGuardTimerRef.current);
    clickGuardTimerRef.current = undefined;
  };

  const startClickGuard = () => {
    clearClickGuard();
    shouldSuppressClickRef.current = true;
  };

  const armClickGuard = () => {
    startClickGuard();
    clickGuardTimerRef.current = setTimeout(() => {
      shouldSuppressClickRef.current = false;
      clickGuardTimerRef.current = undefined;
    }, CALENDAR_SWIPE_CLICK_GUARD_MS);
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
    if (isMotionEnabled || !onMonthChange || event.button !== 0 || event.isPrimary === false)
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

  const handleMonthChangeRequest = (nextMonth: Dayjs) => {
    if (!onMonthChange)
      return;
    onMonthChange(nextMonth.startOf('month'));
  };

  const handleMonthSwipe = (direction: -1 | 0 | 1) => {
    if (!direction || !onMonthChange)
      return;
    const nextMonth = month.add(direction, 'month').startOf('month');
    if (nextMonth.isAfter(dayjs(), 'month'))
      return;
    armClickGuard();
    handleMonthChangeRequest(nextMonth);
  };

  const handleCalendarPeriodSwipe = (direction: -1 | 0 | 1) => {
    if (!direction)
      return;
    if (!isCalendarCollapsed) {
      handleMonthSwipe(direction);
      return;
    }

    const nextDate = selectedDate.add(direction, 'week');
    if (getCalendarWeekStart(nextDate).isAfter(getCalendarWeekStart(dayjs()), 'day'))
      return;
    armClickGuard();
    if (!nextDate.isSame(month, 'month'))
      handleMonthChangeRequest(nextDate.startOf('month'));
    onDateChange(nextDate);
  };

  const handleCalendarDragStart = () => {
    startClickGuard();
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

    handleCalendarPeriodSwipe(horizontalDistance < 0 ? 1 : -1);
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
                  <RecordCalendarCarousel
                    canNavigate={Boolean(onMonthChange)}
                    collapsed={isCalendarCollapsed}
                    collapseLabel={collapseCalendarLabel}
                    days={days}
                    expandLabel={expandCalendarLabel}
                    isMotionEnabled={isMotionEnabled}
                    month={month}
                    onCollapsedChange={setIsCalendarCollapsed}
                    onDateChange={onDateChange}
                    onDragEnd={armClickGuard}
                    onDragStart={handleCalendarDragStart}
                    onMonthChange={handleMonthChangeRequest}
                    selectedDate={selectedDate}
                  />
                </section>
                <m.div
                  animate={isMotionEnabled ? MOTION_PRESETS.contentSwap.animate : undefined}
                  className="flex min-h-0 flex-grow shrink-0 flex-col"
                  data-record-calendar-month-details={monthKey}
                  initial={isMotionEnabled ? MOTION_PRESETS.contentSwap.initial : false}
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
                  {groups.length > 0
                    ? (
                        <div className="mx-[18px] min-h-[220px] flex-grow shrink-0" data-record-calendar-list>
                          <RecordOverviewList groups={groups} renderCategoryIcon={renderCategoryIcon} variant="overview" />
                        </div>
                      )
                    : (
                        <Surface
                          className="mx-[18px] min-h-[220px] flex-grow shrink-0 overflow-hidden"
                          data-record-calendar-list
                          material="content"
                        >
                          <IllustratedEmptyState
                            className="min-h-[210px] py-4"
                            description={emptyDescription}
                            icon={<CalendarDays className="text-primary-deep" size={32} strokeWidth={1.8} />}
                            title={emptyLabel}
                            variant="quiet"
                          />
                        </Surface>
                      )}
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
