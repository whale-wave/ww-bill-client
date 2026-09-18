import type { FC } from 'react';
import type { DateRange, DayButtonProps } from 'react-day-picker';
import type { ChartOverviewCustomRange } from '../model/chart-overview-context';
import { format, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { X } from 'lucide-react';
import { useState } from 'react';
import { DayButton, DayPicker } from 'react-day-picker';
import { AppDatePicker, AppSheet } from '@/shared/ui';

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

function dateWithExistingTime(date: Date, value: string) {
  return `${format(date, 'yyyy-MM-dd')}T${value.slice(11, 19)}`;
}

function isValidRange(range: ChartOverviewCustomRange) {
  return range.startDate <= range.endDate;
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

export const CustomRangeSheet: FC<CustomRangeSheetProps> = ({ onApply, onClose, range, visible }) => {
  const [today] = useState(() => new Date());
  const [draft, setDraft] = useState<ChartOverviewCustomRange>(() => range ?? todayRange(today));
  const [editingField, setEditingField] = useState<keyof ChartOverviewCustomRange>();
  const [calendarRange, setCalendarRange] = useState<DateRange>(() => {
    const initialRange = range ?? todayRange(today);
    return { from: toDate(initialRange.startDate), to: toDate(initialRange.endDate) };
  });

  const isSelectingEndDate = Boolean(calendarRange.from && !calendarRange.to);
  const isValid = isValidRange(draft);
  const handleRangeSelect = (nextRange: DateRange | undefined) => {
    if (!nextRange?.from)
      return;
    setCalendarRange(nextRange);
    if (!nextRange.to) {
      setDraft(current => ({ ...current, startDate: dateWithExistingTime(nextRange.from!, current.startDate) }));
      return;
    }
    setDraft(current => ({
      endDate: dateWithExistingTime(nextRange.to!, current.endDate),
      startDate: dateWithExistingTime(nextRange.from!, current.startDate),
    }));
  };

  return (
    <AppSheet
      bodyClassName="!h-[85dvh] !rounded-t-[24px]"
      closeOnMaskClick
      onClose={onClose}
      visible={visible}
    >
      <section className="flex h-full min-h-0 flex-col bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3" data-chart-custom-range-sheet>
        <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-border-primary" />
        <header className="flex shrink-0 items-center justify-between py-2">
          <h2 className="text-[18px] font-extrabold text-ww-ink">自定义区间</h2>
          <button aria-label="关闭" className="flex size-10 items-center justify-center rounded-full text-ww-mid" onClick={onClose} type="button">
            <X size={21} strokeWidth={2} />
          </button>
        </header>
        <div className="grid shrink-0 grid-cols-1 gap-3 py-2">
          {(['startDate', 'endDate'] as const).map(key => (
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border-primary bg-white px-3 py-2" key={key}>
              <span className="shrink-0 text-[13px] font-bold text-ww-mid">{key === 'startDate' ? '开始时间' : '结束时间'}</span>
              <button className="min-w-0 rounded-[10px] px-2 py-1 text-right text-[14px] font-semibold text-ww-ink" onClick={() => setEditingField(key)} type="button">
                {draft[key].replace('T', ' ')}
              </button>
            </div>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <div className="mb-3 flex items-center justify-between rounded-[12px] bg-primary-light/35 px-3 py-2 text-[11px] font-bold text-ww-mid">
            <span>{isSelectingEndDate ? '已选择开始日期，请继续选择结束日期' : '先选开始日期，再选结束日期'}</span>
            <span className="text-primary-deep">{isSelectingEndDate ? '选择结束日' : '重新选择'}</span>
          </div>
          <DayPicker
            className="w-full"
            classNames={{
              day: 'p-0',
              day_button: 'relative mx-auto flex size-10 items-center justify-center rounded-full text-[14px] font-semibold',
              disabled: 'opacity-35 grayscale [&_button]:cursor-not-allowed [&_button]:text-ww-soft',
              month: 'w-full',
              month_caption: 'text-center text-[16px] font-extrabold text-ww-ink',
              month_grid: 'w-full',
              nav: 'flex items-center justify-between',
              range_end: 'rounded-r-full bg-primary-light/70 [&_button]:bg-[var(--ww-theme-color-deep)] [&_button]:text-white',
              range_middle: 'bg-primary-light/70 [&_button]:rounded-none',
              range_start: 'rounded-l-full bg-primary-light/70 [&_button]:bg-primary [&_button]:text-white',
              root: 'w-full',
              selected: 'bg-primary-light/70',
              today: 'text-primary-deep',
              weekday: 'h-9 text-[12px] font-bold text-ww-soft',
            }}
            components={{ DayButton: RangeDayButton }}
            disabled={{ after: today }}
            locale={zhCN}
            mode="range"
            modifiers={{
              range_pending_start: date => Boolean(calendarRange.from && !calendarRange.to && isSameDay(date, calendarRange.from)),
              same_day: date => Boolean(calendarRange.from && calendarRange.to && isSameDay(calendarRange.from, calendarRange.to) && isSameDay(date, calendarRange.from)),
            }}
            modifiersClassNames={{
              range_pending_start: 'rounded-full [&_button]:bg-primary [&_button]:text-white',
              same_day: 'rounded-full bg-primary-light/70 [&_button]:!bg-[var(--ww-theme-color-mid)] [&_button]:!text-white',
            }}
            onSelect={handleRangeSelect}
            resetOnSelect
            selected={calendarRange}
            weekStartsOn={1}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-bold text-ww-mid">
            <span className="inline-flex items-center gap-1">
              <i className="flex size-4 items-center justify-center rounded-full bg-primary text-[8px] not-italic text-white">起</i>
              开始
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="flex size-4 items-center justify-center rounded-full bg-[var(--ww-theme-color-deep)] text-[8px] not-italic text-white">止</i>
              结束
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="flex size-4 items-center justify-center rounded-full bg-[var(--ww-theme-color-mid)] text-[8px] not-italic text-white">同</i>
              同日
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="flex size-4 items-center justify-center rounded-full bg-ww-surface-tint text-[8px] not-italic text-ww-soft">灰</i>
              不可选
            </span>
          </div>
        </div>
        {!isValid && <p className="shrink-0 pb-2 text-center text-[12px] font-medium text-[#b24f71]">开始时间不能晚于结束时间</p>}
        <footer className="flex shrink-0 gap-3 border-t border-border-primary pt-3">
          <button className="h-12 flex-1 rounded-[14px] border border-border-primary bg-white text-[15px] font-bold text-ww-mid" onClick={onClose} type="button">取消</button>
          <button className="ww-theme-primary-action h-12 flex-[1.6] rounded-[14px] text-[15px] font-extrabold disabled:opacity-45" disabled={!isValid} onClick={() => onApply(draft)} type="button">查看统计</button>
        </footer>
      </section>
      <AppDatePicker
        max={today}
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
