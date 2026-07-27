import type { FC } from 'react';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import { shiftMonth } from '../model';

interface HouseholdMonthPickerProps {
  compact?: boolean;
  month: string;
  nextLabel: string;
  onChange: (month: string) => void;
  previousLabel: string;
}

export const HouseholdMonthPicker: FC<HouseholdMonthPickerProps> = ({
  compact = false,
  month,
  nextLabel,
  onChange,
  previousLabel,
}) => (
  <div className={`flex items-center justify-center ${compact ? 'min-w-0 gap-1' : 'gap-3'}`} data-testid={compact ? 'household-compact-month-picker' : undefined}>
    <button
      aria-label={previousLabel}
      className={`flex items-center justify-center rounded-full border-0 bg-white text-font-black ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
      onClick={() => onChange(shiftMonth(month, -1))}
      type="button"
    >
      <LeftOutline />
    </button>
    <input
      aria-label="month"
      className={`${compact ? 'h-8 w-[68px] rounded px-1 text-sm' : 'h-9 rounded-lg px-3 text-base'} border border-solid border-[#E5E7EB] bg-white text-center text-font-black`}
      onChange={event => onChange(`${event.target.value}-01`)}
      type="month"
      value={month.slice(0, 7)}
    />
    <button
      aria-label={nextLabel}
      className={`flex items-center justify-center rounded-full border-0 bg-white text-font-black ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
      onClick={() => onChange(shiftMonth(month, 1))}
      type="button"
    >
      <RightOutline />
    </button>
  </div>
);
