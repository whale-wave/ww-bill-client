import type { FC } from 'react';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import { shiftMonth } from '../model';

interface HouseholdMonthPickerProps {
  month: string;
  nextLabel: string;
  onChange: (month: string) => void;
  previousLabel: string;
}

export const HouseholdMonthPicker: FC<HouseholdMonthPickerProps> = ({
  month,
  nextLabel,
  onChange,
  previousLabel,
}) => (
  <div className="flex items-center justify-center gap-3">
    <button
      aria-label={previousLabel}
      className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white text-font-black"
      onClick={() => onChange(shiftMonth(month, -1))}
      type="button"
    >
      <LeftOutline />
    </button>
    <input
      aria-label="month"
      className="h-9 rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 text-center text-base text-font-black"
      onChange={event => onChange(`${event.target.value}-01`)}
      type="month"
      value={month.slice(0, 7)}
    />
    <button
      aria-label={nextLabel}
      className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white text-font-black"
      onClick={() => onChange(shiftMonth(month, 1))}
      type="button"
    >
      <RightOutline />
    </button>
  </div>
);
