import type { FC } from 'react';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import { Triangle } from 'lucide-react';
import { shiftMonth } from '../model';

interface HouseholdMonthPickerProps {
  isCompact?: boolean;
  isDetailTrigger?: boolean;
  month: string;
  monthLabel?: string;
  nextLabel: string;
  onChange: (month: string) => void;
  previousLabel: string;
}

export const HouseholdMonthPicker: FC<HouseholdMonthPickerProps> = ({
  isCompact = false,
  isDetailTrigger = false,
  month,
  monthLabel,
  nextLabel,
  onChange,
  previousLabel,
}) => {
  if (isDetailTrigger) {
    return (
      <label className="relative flex h-10 w-[88px] cursor-pointer items-end text-font-black" data-testid="household-detail-month-picker">
        <span className="text-[length:var(--ww-font-size-2xl)] leading-none">{month.slice(5, 7)}</span>
        <span className="ml-1 text-base">{monthLabel}</span>
        <Triangle
          className="mb-[2px] ml-1 rotate-180"
          fill="currentColor"
          size={10}
          stroke="none"
        />
        <input
          aria-label="month"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={event => onChange(`${event.target.value}-01`)}
          type="month"
          value={month.slice(0, 7)}
        />
      </label>
    );
  }

  return (
    <div className={`flex items-center justify-center ${isCompact ? 'w-full min-w-0 gap-0.5' : 'gap-3'}`} data-testid={isCompact ? 'household-compact-month-picker' : undefined}>
      <button
        aria-label={previousLabel}
        className={`flex shrink-0 items-center justify-center rounded-full border-0 bg-white text-font-black ${isCompact ? 'h-7 w-6' : 'h-9 w-9'}`}
        onClick={() => onChange(shiftMonth(month, -1))}
        type="button"
      >
        <LeftOutline />
      </button>
      <input
        aria-label="month"
        className={`${isCompact ? 'h-8 min-w-0 flex-1 rounded px-0 text-[11px]' : 'h-9 rounded-lg px-3 text-base'} border border-solid border-[#E5E7EB] bg-white text-center text-font-black`}
        onChange={event => onChange(`${event.target.value}-01`)}
        type="month"
        value={month.slice(0, 7)}
      />
      <button
        aria-label={nextLabel}
        className={`flex shrink-0 items-center justify-center rounded-full border-0 bg-white text-font-black ${isCompact ? 'h-7 w-6' : 'h-9 w-9'}`}
        onClick={() => onChange(shiftMonth(month, 1))}
        type="button"
      >
        <RightOutline />
      </button>
    </div>
  );
};
