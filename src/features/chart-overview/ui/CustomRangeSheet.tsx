import type { FC } from 'react';
import type { DateRange, DayButtonProps } from 'react-day-picker';
import type { ChartOverviewCustomRange } from '../model/chart-overview-context';
import { addYears, endOfDay, format, isSameDay, startOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayButton, DayPicker } from 'react-day-picker';
import { AppButton, AppDatePicker, AppSheet, SheetHeader } from '@/shared/ui';
import { isCustomRangeWithinLimit } from '../model/custom-range';

interface CustomRangeSheetProps {
  onApply: (range: ChartOverviewCustomRange) => void;
  onClose: () => void;
  range?: ChartOverviewCustomRange;
  visible: boolean;
}

function todayRange(today: Date): ChartOverviewCustomRange {
  const date = format(today, 'yyyy-MM-dd');
  return { startDate: `${date}T00:00:00`, endDate: `${date}T23:59:59` };
}

function toDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function isValidRange(range: ChartOverviewCustomRange) {
  return range.startDate <= range.endDate && isCustomRangeWithinLimit(range);
}

function RangeDayButton({ children, modifiers, ...props }: DayButtonProps) {
  const marker = modifiers.same_day
    ? '同'
    : modifiers.range_pending_start || modifiers.range_start
      ? '起'
      : modifiers.range_end
        ? '止'
        : undefined;

  return (
    <DayButton modifiers={modifiers} {...props}>
      {children}
      {marker && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-white/90 text-[8px] font-black leading-none text-ww-ink shadow-ww-xs">{marker}</span>}
    </DayButton>
  );
}

interface CalendarNavigationProps {
  displayedMonth: Date;
  isMonthPickerVisible: boolean;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onToggleMonthPicker: () => void;
  today: Date;
}

function CalendarNavigation({ displayedMonth, isMonthPickerVisible, onNextMonth, onPreviousMonth, onToggleMonthPicker, today }: CalendarNavigationProps) {
  const isCurrentMonth = displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth();

  if (isMonthPickerVisible)
    return null;

  return (
    <div className="flex h-11 items-center justify-between">
      <button aria-label="上个月" className="flex size-11 items-center justify-center rounded-full text-ww-mid transition active:bg-primary-light/40" onClick={onPreviousMonth} type="button">
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button aria-expanded={isMonthPickerVisible} className="flex min-h-11 items-center justify-center rounded-[10px] px-4 text-[16px] font-extrabold text-ww-ink transition active:bg-primary-light/40" onClick={onToggleMonthPicker} type="button">
        {format(displayedMonth, 'yyyy年M月')}
      </button>
      <button aria-label="下个月" className="flex size-11 items-center justify-center rounded-full text-ww-mid transition active:bg-primary-light/40 disabled:opacity-35" disabled={isCurrentMonth} onClick={onNextMonth} type="button">
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </div>
  );
}

interface MonthPickerPanelProps {
  monthPickerYear: number;
  onMonthSelect: (month: number) => void;
  onNextYear: () => void;
  onPreviousYear: () => void;
  onClose: () => void;
  today: Date;
}

function MonthPickerPanel({ monthPickerYear, onClose, onMonthSelect, onNextYear, onPreviousYear, today }: MonthPickerPanelProps) {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  return (
    <div className="rounded-[14px] border border-border-primary bg-white/70 p-2">
      <button className="mb-1 min-h-9 px-1 text-[12px] font-bold text-primary-deep" onClick={onClose} type="button">返回日历</button>
      <div className="flex h-11 items-center justify-between">
        <button aria-label="上一年" className="flex size-11 items-center justify-center rounded-full text-ww-mid active:bg-primary-light/40" onClick={onPreviousYear} type="button">
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <span className="text-[16px] font-extrabold text-ww-ink">
          {monthPickerYear}
          年
        </span>
        <button aria-label="下一年" className="flex size-11 items-center justify-center rounded-full text-ww-mid active:bg-primary-light/40 disabled:opacity-35" disabled={monthPickerYear >= currentYear} onClick={onNextYear} type="button">
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, month) => {
          const isFuture = monthPickerYear > currentYear || (monthPickerYear === currentYear && month > currentMonth);
          return (
            <button className="h-11 rounded-[10px] border border-border-primary bg-white/80 text-[13px] font-bold text-ww-mid shadow-ww-xs transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-35" disabled={isFuture} key={month} onClick={() => onMonthSelect(month)} type="button">
              {month + 1}
              月
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const CustomRangeSheet: FC<CustomRangeSheetProps> = ({ onApply, onClose, range, visible }) => {
  const [today] = useState(() => new Date());
  const initialRange = range ?? todayRange(today);
  const [draft, setDraft] = useState<ChartOverviewCustomRange>(initialRange);
  const [editingField, setEditingField] = useState<keyof ChartOverviewCustomRange>();
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(() => ({ from: toDate(initialRange.startDate), to: toDate(initialRange.endDate) }));
  const [displayedMonth, setDisplayedMonth] = useState(() => startOfMonth(toDate(initialRange.startDate)));
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [monthPickerYear, setMonthPickerYear] = useState(() => displayedMonth.getFullYear());

  const isSelectingEndDate = Boolean(calendarRange?.from && !calendarRange.to);
  const isValid = isValidRange(draft);
  const disabledDates = useMemo(() => {
    const matchers: Array<{ after: Date }> = [{ after: today }];
    if (isSelectingEndDate && calendarRange?.from)
      matchers.push({ after: addYears(calendarRange.from, 3) });
    return matchers;
  }, [calendarRange?.from, isSelectingEndDate, today]);

  const handleRangeSelect = (nextRange: DateRange | undefined) => {
    if (!nextRange?.from)
      return;
    setCalendarRange(nextRange);
    if (!nextRange.to)
      return;
    setDraft({
      endDate: `${format(nextRange.to, 'yyyy-MM-dd')}T23:59:59`,
      startDate: `${format(nextRange.from, 'yyyy-MM-dd')}T00:00:00`,
    });
  };

  const handleResetSelection = () => {
    setCalendarRange(undefined);
    setIsMonthPickerVisible(false);
  };

  const handleMonthSelect = (month: number) => {
    setDisplayedMonth(new Date(monthPickerYear, month, 1));
    setIsMonthPickerVisible(false);
  };

  return (
    <AppSheet
      bodyClassName="!h-[80dvh] !max-h-[calc(100dvh-12px)] !rounded-t-[24px]"
      // Keep a classic viewport fallback for Android WebViews/Chrome versions
      // that do not parse dynamic viewport units. The class-based dvh values
      // take over when supported.
      bodyStyle={{ height: '80vh', maxHeight: 'calc(100vh - 12px)' }}
      closeOnMaskClick
      onClose={onClose}
      visible={visible}
    >
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white" data-chart-custom-range-sheet>
        <SheetHeader closeLabel="关闭" onClose={onClose} title="自定义区间" />
        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-3 overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]" data-chart-custom-range-content>
          <div className="grid grid-cols-1 gap-3 pb-3">
            {(['startDate', 'endDate'] as const).map(key => (
              <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border-primary bg-white px-3 py-2" key={key}>
                <span className="shrink-0 text-[13px] font-bold text-ww-mid">{key === 'startDate' ? '开始时间' : '结束时间'}</span>
                <button className="min-h-11 min-w-0 rounded-[10px] px-2 py-1 text-right text-[14px] font-semibold text-ww-ink" onClick={() => setEditingField(key)} type="button">
                  {draft[key].slice(0, 10)}
                </button>
              </div>
            ))}
          </div>
          <div className="mb-2 flex min-h-9 items-center justify-between px-1">
            <span className="text-[12px] font-medium text-ww-soft">{isSelectingEndDate ? '请选择结束日期' : '选择日期范围'}</span>
            <button className="min-h-9 px-1 text-[12px] font-extrabold text-primary-deep" onClick={handleResetSelection} type="button">重新选择</button>
          </div>
          <CalendarNavigation
            displayedMonth={displayedMonth}
            isMonthPickerVisible={isMonthPickerVisible}
            onNextMonth={() => setDisplayedMonth(month => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            onPreviousMonth={() => setDisplayedMonth(month => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            onToggleMonthPicker={() => {
              setMonthPickerYear(displayedMonth.getFullYear());
              setIsMonthPickerVisible(value => !value);
            }}
            today={today}
          />
          {isMonthPickerVisible
            ? <MonthPickerPanel monthPickerYear={monthPickerYear} onClose={() => setIsMonthPickerVisible(false)} onMonthSelect={handleMonthSelect} onNextYear={() => setMonthPickerYear(year => Math.min(today.getFullYear(), year + 1))} onPreviousYear={() => setMonthPickerYear(year => year - 1)} today={today} />
            : (
                <DayPicker
                  className="w-full"
                  classNames={{
                    day: 'relative isolate p-0',
                    day_button: 'relative z-10 mx-auto flex size-10 items-center justify-center rounded-full text-[14px] font-semibold',
                    disabled: 'opacity-35 grayscale [&_button]:cursor-not-allowed [&_button]:text-ww-soft',
                    month: 'w-full',
                    month_caption: 'hidden',
                    month_grid: 'w-full',
                    nav: 'hidden',
                    range_end: 'relative before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:right-1/2 before:z-0 before:bg-[color:var(--ww-theme-color-light)] [&_button]:bg-[var(--ww-theme-color-deep)] [&_button]:text-white',
                    range_middle: 'relative before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[color:var(--ww-theme-color-light)] [&_button]:!rounded-none [&_button]:!bg-[color:var(--ww-theme-color-light)]',
                    range_start: 'relative after:pointer-events-none after:absolute after:inset-y-0 after:left-1/2 after:right-0 after:z-0 after:bg-[color:var(--ww-theme-color-light)] [&_button]:bg-primary [&_button]:text-white',
                    root: 'w-full',
                    selected: 'bg-transparent',
                    today: 'text-primary-deep',
                    weekday: 'h-9 text-[12px] font-bold text-ww-soft',
                  }}
                  components={{ DayButton: RangeDayButton }}
                  disabled={disabledDates}
                  locale={zhCN}
                  mode="range"
                  modifiers={{
                    range_pending_start: date => Boolean(calendarRange?.from && !calendarRange.to && isSameDay(date, calendarRange.from)),
                    same_day: date => Boolean(calendarRange?.from && calendarRange.to && isSameDay(calendarRange.from, calendarRange.to) && isSameDay(date, calendarRange.from)),
                  }}
                  modifiersClassNames={{
                    range_pending_start: 'rounded-full [&_button]:bg-primary [&_button]:text-white',
                    same_day: '[&_button]:!bg-[var(--ww-theme-color-mid)] [&_button]:!text-white',
                  }}
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  onSelect={handleRangeSelect}
                  resetOnSelect
                  selected={calendarRange}
                  weekStartsOn={1}
                />
              )}
          {!isValid && <p className="px-1 pb-2 text-center text-[12px] font-medium text-feedback-danger">{draft.startDate > draft.endDate ? '开始时间不能晚于结束时间' : '统计范围不能超过三年'}</p>}
        </main>
        <footer className="flex shrink-0 gap-[var(--ww-space-sm)] border-t border-border-primary bg-white px-[var(--ww-component-sheet-padding-x)] pb-[max(var(--ww-space-md),env(safe-area-inset-bottom))] pt-[var(--ww-space-sm)]">
          <AppButton className="min-w-0 flex-1" onClick={onClose} size="medium" variant="secondary">取消</AppButton>
          <AppButton className="min-w-0 flex-[1.6]" disabled={!isValid} onClick={() => onApply(draft)} size="medium">查看统计</AppButton>
        </footer>
      </section>
      <AppDatePicker
        max={endOfDay(today)}
        onClose={() => setEditingField(undefined)}
        onConfirm={(value) => {
          if (editingField) {
            const nextRange = { ...draft, [editingField]: format(value, 'yyyy-MM-dd\'T\'HH:mm:ss') };
            const from = toDate(nextRange.startDate);
            const to = toDate(nextRange.endDate);
            setDraft(nextRange);
            setCalendarRange({ from, to: from <= to ? to : undefined });
          }
          setEditingField(undefined);
        }}
        precision="second"
        title={editingField === 'startDate' ? '选择开始时间' : '选择结束时间'}
        value={editingField ? new Date(draft[editingField]) : undefined}
        visible={Boolean(editingField)}
      />
    </AppSheet>
  );
};
