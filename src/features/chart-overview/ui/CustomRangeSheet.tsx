import type { FC } from 'react';
import type { DateRange } from 'react-day-picker';
import type { ChartOverviewCustomRange } from '../model/chart-overview-context';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { AppSheet } from '@/shared/ui';

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

export const CustomRangeSheet: FC<CustomRangeSheetProps> = ({ onApply, onClose, range, visible }) => {
  const [today] = useState(() => new Date());
  const [draft, setDraft] = useState<ChartOverviewCustomRange>(() => range ?? todayRange(today));

  const selected = useMemo<DateRange>(() => ({ from: toDate(draft.startDate), to: toDate(draft.endDate) }), [draft]);
  const isValid = isValidRange(draft);
  const handleRangeSelect = (nextRange: DateRange | undefined) => {
    if (!nextRange?.from)
      return;
    if (!nextRange.to) {
      setDraft(current => ({
        endDate: dateWithExistingTime(nextRange.from!, current.endDate),
        startDate: dateWithExistingTime(nextRange.from!, current.startDate),
      }));
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
            <label className="flex items-center justify-between gap-3 rounded-[14px] border border-border-primary bg-white px-3 py-2" key={key}>
              <span className="shrink-0 text-[13px] font-bold text-ww-mid">{key === 'startDate' ? '开始时间' : '结束时间'}</span>
              <input
                className="min-w-0 bg-transparent text-right text-[14px] font-semibold text-ww-ink outline-none"
                max={format(today, 'yyyy-MM-dd\'T\'23:59:59')}
                onChange={event => setDraft(current => ({ ...current, [key]: event.target.value }))}
                step="1"
                type="datetime-local"
                value={draft[key]}
              />
            </label>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <DayPicker
            className="w-full"
            classNames={{
              day: 'p-0',
              day_button: 'mx-auto flex size-10 items-center justify-center rounded-full text-[14px] font-semibold',
              month: 'w-full',
              month_caption: 'text-center text-[16px] font-extrabold text-ww-ink',
              month_grid: 'w-full',
              nav: 'flex items-center justify-between',
              root: 'w-full',
              selected: 'bg-primary-light/60',
              today: 'text-primary-deep',
              weekday: 'h-9 text-[12px] font-bold text-ww-soft',
            }}
            disabled={{ after: today }}
            locale={zhCN}
            mode="range"
            onSelect={handleRangeSelect}
            selected={selected}
            weekStartsOn={1}
          />
        </div>
        {!isValid && <p className="shrink-0 pb-2 text-center text-[12px] font-medium text-[#b24f71]">开始时间不能晚于结束时间</p>}
        <footer className="flex shrink-0 gap-3 border-t border-border-primary pt-3">
          <button className="h-12 flex-1 rounded-[14px] border border-border-primary bg-white text-[15px] font-bold text-ww-mid" onClick={onClose} type="button">取消</button>
          <button className="ww-theme-primary-action h-12 flex-[1.6] rounded-[14px] text-[15px] font-extrabold disabled:opacity-45" disabled={!isValid} onClick={() => onApply(draft)} type="button">查看统计</button>
        </footer>
      </section>
    </AppSheet>
  );
};
