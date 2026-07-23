import type { FC } from 'react';
import { DatePicker } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import dayjs from 'dayjs';

interface RecordMonthPickerProps {
  ariaLabel: string;
  monthLabel: string;
  onChange: (value: Date) => void;
  value: Date;
}

export const RecordMonthPicker: FC<RecordMonthPickerProps> = ({
  ariaLabel,
  monthLabel,
  onChange,
  value,
}) => {
  const handleClick = () => {
    void DatePicker.prompt({
      defaultValue: value,
      onConfirm: onChange,
      precision: 'month',
      title: ariaLabel,
    });
  };

  return (
    <button
      aria-label={ariaLabel}
      className="flex items-end border-0 bg-transparent p-0 text-[#333]"
      onClick={handleClick}
      type="button"
    >
      <span className="text-2xl leading-[30px]">{dayjs(value).format('MM')}</span>
      <span className="text-base">{monthLabel}</span>
      <DownFill aria-hidden="true" className="mb-[5px] ml-1 text-[10px]" />
    </button>
  );
};
