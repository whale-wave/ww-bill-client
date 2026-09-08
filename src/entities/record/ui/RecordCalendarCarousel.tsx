import type { Dayjs } from 'dayjs';
import type { PanInfo } from 'motion/react';
import type { FC, ReactNode } from 'react';
import type { DayButtonProps, WeekProps } from 'react-day-picker';
import type { RecordCalendarDay } from './RecordCalendarPresentation';
import dayjs from 'dayjs';
import { ChevronUp } from 'lucide-react';
import { animate, m, useMotionValue } from 'motion/react';
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { enUS, zhCN } from 'react-day-picker/locale';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { getCalendarDragDirection, getCalendarWeekStart } from './record-calendar-motion';

interface RecordCalendarCarouselProps {
  canNavigate: boolean;
  collapsed: boolean;
  collapseLabel: string;
  days: RecordCalendarDay[];
  expandLabel: string;
  isMotionEnabled: boolean;
  month: Dayjs;
  onCollapsedChange: (collapsed: boolean) => void;
  onDateChange: (date: Dayjs) => void;
  onDragEnd: () => void;
  onDragStart: () => void;
  onMonthChange: (month: Dayjs) => void;
  selectedDate: Dayjs;
}

interface RecordCalendarMonthProps {
  canNavigate: boolean;
  collapsed: boolean;
  days: RecordCalendarDay[];
  fixedWeeks: boolean;
  interactive?: boolean;
  isMotionEnabled: boolean;
  locale: typeof zhCN;
  month: Dayjs;
  onDateChange: (date: Dayjs) => void;
  onMonthChange: (month: Dayjs) => void;
  selectedDate: Dayjs;
  showOutsideDays: boolean;
}

const CALENDAR_CAROUSEL_SPRING = {
  damping: 32,
  stiffness: 360,
  type: 'spring' as const,
};

const CALENDAR_RESIZE_DURATION_MS = 300;
const CALENDAR_RESIZE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CALENDAR_SLIDE_POSITIONS = ['previous', 'current', 'next'] as const;

const RecordCalendarMonthContext = createContext<{
  collapsed: boolean;
  dayMap: Map<string, RecordCalendarDay>;
  focusDate: Dayjs;
  isMotionEnabled: boolean;
}>({ collapsed: false, dayMap: new Map(), focusDate: dayjs(), isMotionEnabled: false });

function RecordCalendarDayButton({ day, modifiers, ...buttonProps }: DayButtonProps) {
  const { dayMap, isMotionEnabled } = useContext(RecordCalendarMonthContext);
  const dateValue = dayjs(day.date);
  const summary = dayMap.get(dateValue.format('YYYY-MM-DD'));
  const isSelected = modifiers.selected;

  return (
    <m.div className="h-full w-full" layout={isMotionEnabled && isSelected ? 'position' : false}>
      <button
        {...buttonProps}
        className={cn(
          buttonProps.className,
          'flex h-[clamp(46px,6.6dvh,50px)] w-full flex-col items-center justify-center rounded-[13px] border border-solid border-transparent bg-transparent p-0 text-inherit',
          isSelected && 'border-primary-mid',
          modifiers.today && !isSelected && 'text-primary-deep',
          modifiers.outside && 'opacity-30',
        )}
        data-date={dateValue.format('YYYY-MM-DD')}
        type="button"
      >
        <span
          className="flex h-5 w-6 items-center justify-center text-[13px] font-bold"
          data-calendar-day-number
        >
          {dateValue.date()}
        </span>
        <span className="mt-px flex flex-col items-center gap-px text-[9px] font-semibold leading-[9px]">
          <span className="flex min-h-[9px] justify-center text-finance-income">
            {summary?.income ? `+${summary.income}` : null}
          </span>
          <span className="flex min-h-[9px] justify-center text-finance-expense">
            {summary?.expense ? `-${summary.expense}` : null}
          </span>
        </span>
      </button>
    </m.div>
  );
}

function RecordCalendarWeek({ week, ...rowProps }: WeekProps) {
  const { collapsed, focusDate } = useContext(RecordCalendarMonthContext);
  const containsFocusDate = week.days.some(day => dayjs(day.date).isSame(focusDate, 'day'));

  return <tr {...rowProps} hidden={collapsed && !containsFocusDate} />;
}

const RecordCalendarMonth: FC<RecordCalendarMonthProps> = ({
  canNavigate,
  collapsed,
  days,
  fixedWeeks,
  interactive = true,
  isMotionEnabled,
  locale,
  month,
  onDateChange,
  onMonthChange,
  selectedDate,
  showOutsideDays,
}) => {
  const dayMap = useMemo(() => new Map(days.map(day => [day.date, day])), [days]);
  const focusDate = selectedDate.isSame(month, 'month')
    ? selectedDate
    : month.date(Math.min(selectedDate.date(), month.daysInMonth()));

  return (
    <RecordCalendarMonthContext.Provider value={{ collapsed, dayMap, focusDate, isMotionEnabled }}>
      <DayPicker
        aria-label={month.format('YYYY / MM')}
        className="w-full"
        classNames={{
          day: 'h-[clamp(46px,6.6dvh,50px)] p-0 align-middle',
          day_button: 'w-full',
          month: 'w-full',
          month_caption: 'hidden',
          month_grid: 'w-full table-fixed border-separate border-spacing-x-[2px] border-spacing-y-[3px]',
          months: 'w-full',
          nav: 'hidden',
          outside: 'text-ww-soft',
          root: 'w-full',
          weekday: 'h-11 pb-1 align-middle text-[11px] font-bold text-ww-soft',
          weekdays: '',
        }}
        components={{ DayButton: RecordCalendarDayButton, Week: RecordCalendarWeek }}
        disableNavigation
        disabled={(date) => {
          const dateValue = dayjs(date);
          const isOutsideMonth = !dateValue.isSame(month, 'month');
          return !interactive
            || (isOutsideMonth && (!canNavigate || dateValue.isAfter(dayjs(), 'month')));
        }}
        fixedWeeks={fixedWeeks}
        hideNavigation
        locale={locale}
        mode="single"
        month={month.toDate()}
        onSelect={(date) => {
          if (!date || !interactive)
            return;
          const nextDate = dayjs(date);
          if (!nextDate.isSame(month, 'month'))
            onMonthChange(nextDate.startOf('month'));
          onDateChange(nextDate);
        }}
        selected={selectedDate.toDate()}
        showOutsideDays={showOutsideDays}
        weekStartsOn={1}
      />
    </RecordCalendarMonthContext.Provider>
  );
};

const CalendarCarouselTrack: FC<Omit<
  RecordCalendarCarouselProps,
  'collapseLabel' | 'expandLabel' | 'onCollapsedChange'
> & { locale: typeof zhCN }> = ({
  canNavigate,
  collapsed,
  days,
  isMotionEnabled,
  locale,
  month,
  onDateChange,
  onDragEnd,
  onDragStart,
  onMonthChange,
  selectedDate,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isSettling, setIsSettling] = useState(false);
  const x = useMotionValue(0);
  const canGoNext = canNavigate && (collapsed
    ? getCalendarWeekStart(selectedDate).isBefore(getCalendarWeekStart(dayjs()), 'day')
    : month.isBefore(dayjs(), 'month'));
  const monthKey = month.format('YYYY-MM');
  const periodKey = collapsed
    ? getCalendarWeekStart(selectedDate).format('YYYY-MM-DD')
    : monthKey;
  const slides = useMemo(() => collapsed
    ? [selectedDate.subtract(1, 'week'), selectedDate, selectedDate.add(1, 'week')]
    : [month.subtract(1, 'month'), month, month.add(1, 'month')], [collapsed, month, selectedDate]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport)
      return;

    const updateWidth = () => {
      const nextWidth = viewport.clientWidth;
      setViewportWidth(nextWidth);
      x.jump(-nextWidth);
    };
    x.jump(-viewport.clientWidth);
    const initialFrame = requestAnimationFrame(updateWidth);
    if (typeof ResizeObserver === 'undefined')
      return () => cancelAnimationFrame(initialFrame);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => {
      cancelAnimationFrame(initialFrame);
      observer.disconnect();
    };
  }, [x]);

  useLayoutEffect(() => {
    if (viewportWidth)
      x.jump(-viewportWidth);
  }, [periodKey, viewportWidth, x]);

  const settle = async (info: PanInfo) => {
    if (!viewportWidth)
      return;
    onDragEnd();
    setIsSettling(true);
    const requestedDirection = getCalendarDragDirection({
      offsetX: info.offset.x,
      offsetY: info.offset.y,
      velocityX: info.velocity.x,
      velocityY: info.velocity.y,
    });
    const direction = requestedDirection === 1 && !canGoNext ? 0 : requestedDirection;
    const targetX = direction < 0
      ? 0
      : direction > 0 ? -viewportWidth * 2 : -viewportWidth;

    await animate(x, targetX, CALENDAR_CAROUSEL_SPRING);
    if (direction) {
      if (collapsed) {
        const nextDate = selectedDate.add(direction, 'week');
        if (!nextDate.isSame(month, 'month'))
          onMonthChange(nextDate.startOf('month'));
        onDateChange(nextDate);
      }
      else {
        onMonthChange(month.add(direction, 'month').startOf('month'));
      }
      requestAnimationFrame(() => setIsSettling(false));
    }
    else {
      setIsSettling(false);
    }
  };

  return (
    <div
      className="w-full overflow-hidden"
      data-record-calendar-carousel
      ref={viewportRef}
    >
      <m.div
        className="flex touch-pan-y"
        drag={isMotionEnabled && canNavigate && !isSettling ? 'x' : false}
        dragConstraints={{
          left: canGoNext ? -viewportWidth * 2 : -viewportWidth,
          right: 0,
        }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={(_event, info) => void settle(info)}
        onDragStart={onDragStart}
        style={{ x }}
      >
        {slides.map((slidePeriod, index) => {
          const slideMonth = collapsed ? slidePeriod.startOf('month') : slidePeriod;
          const slideSelectedDate = collapsed ? slidePeriod : selectedDate;
          const slideKey = collapsed
            ? `week-${getCalendarWeekStart(slidePeriod).format('YYYY-MM-DD')}`
            : `month-${slideMonth.format('YYYY-MM')}`;
          return (
            <div
              aria-hidden={index !== 1}
              className="min-w-0 flex-[0_0_100%]"
              data-record-calendar-current={index === 1 ? 'true' : undefined}
              data-record-calendar-month={slideMonth.format('YYYY-MM')}
              data-record-calendar-period={slideKey}
              data-record-calendar-position={CALENDAR_SLIDE_POSITIONS[index]}
              key={CALENDAR_SLIDE_POSITIONS[index]}
            >
              <RecordCalendarMonth
                canNavigate={canNavigate}
                collapsed={collapsed}
                days={days}
                fixedWeeks
                interactive={index === 1}
                isMotionEnabled={isMotionEnabled}
                locale={locale}
                month={slideMonth}
                onDateChange={onDateChange}
                onMonthChange={onMonthChange}
                selectedDate={slideSelectedDate}
                showOutsideDays
              />
            </div>
          );
        })}
      </m.div>
    </div>
  );
};

const CalendarHeightTransition: FC<{
  children: ReactNode;
  collapsed: boolean;
  isMotionEnabled: boolean;
}> = ({ children, collapsed, isMotionEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousHeightRef = useRef<number>();
  const animationRef = useRef<Animation>();

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content)
      return;

    const nextHeight = content.offsetHeight;
    const previousHeight = animationRef.current
      ? container.getBoundingClientRect().height
      : previousHeightRef.current;
    animationRef.current?.cancel();
    animationRef.current = undefined;
    previousHeightRef.current = nextHeight;

    if (
      !isMotionEnabled
      || previousHeight === undefined
      || previousHeight === nextHeight
      || typeof container.animate !== 'function'
    ) {
      container.style.height = 'auto';
      return;
    }

    container.style.height = `${nextHeight}px`;
    const animation = container.animate(
      [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
      { duration: CALENDAR_RESIZE_DURATION_MS, easing: CALENDAR_RESIZE_EASING },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation)
        return;
      container.style.height = 'auto';
      animationRef.current = undefined;
    };
  }, [collapsed, isMotionEnabled]);

  useEffect(() => () => animationRef.current?.cancel(), []);

  return (
    <div className="overflow-hidden" ref={containerRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export const RecordCalendarCarousel: FC<RecordCalendarCarouselProps> = ({
  collapsed,
  collapseLabel,
  expandLabel,
  onCollapsedChange,
  ...props
}) => {
  const { i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage?.startsWith('en') ? enUS : zhCN;
  const calendarView = <CalendarCarouselTrack {...props} collapsed={collapsed} locale={locale} />;

  return (
    <div data-calendar-collapsed={collapsed ? 'true' : 'false'}>
      <CalendarHeightTransition collapsed={collapsed} isMotionEnabled={props.isMotionEnabled}>
        {calendarView}
      </CalendarHeightTransition>
      <button
        aria-expanded={!collapsed}
        aria-label={collapsed ? expandLabel : collapseLabel}
        className="mx-auto mt-1 flex h-11 items-center gap-1 rounded-full border-0 bg-primary-light/55 px-4 text-[11px] font-extrabold text-primary-dark active:bg-primary-light"
        data-calendar-collapse-toggle
        onClick={() => onCollapsedChange(!collapsed)}
        type="button"
      >
        <ChevronUp
          aria-hidden="true"
          className={cn(props.isMotionEnabled && 'transition-transform', collapsed && 'rotate-180')}
          size={14}
          strokeWidth={2.4}
        />
        {collapsed ? expandLabel : collapseLabel}
      </button>
    </div>
  );
};
