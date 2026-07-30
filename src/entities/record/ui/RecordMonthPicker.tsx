import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { Triangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib';

interface RecordMonthPickerProps {
  month: Dayjs;
  monthLabel: ReactNode;
  onChange: (month: Dayjs) => void;
  testId?: string;
}

export const RecordMonthPicker: FC<RecordMonthPickerProps> = ({
  month,
  monthLabel,
  onChange,
  testId,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button
        className="relative flex items-end border-0 bg-transparent p-0 text-font-black"
        data-testid={testId}
        onClick={() => setIsVisible(true)}
        type="button"
      >
        <span className="text-[length:var(--ww-font-size-2xl)] leading-none">
          {month.format('MM')}
        </span>
        <span className="ml-1 text-base">{monthLabel}</span>
        <Triangle
          className={cn(
            'mb-[2px] ml-1 transition-transform duration-200 ease-in-out',
            isVisible ? 'rotate-0' : 'rotate-180',
          )}
          fill="currentColor"
          size={10}
          stroke="none"
        />
      </button>
      <DatePicker
        max={dayjs().toDate()}
        onClose={() => setIsVisible(false)}
        onConfirm={value => onChange(dayjs(value))}
        precision="month"
        value={month.toDate()}
        visible={isVisible}
      />
    </>
  );
};
