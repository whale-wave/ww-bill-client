import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import { Popup } from 'antd-mobile';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
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
  const [draftMonth, setDraftMonth] = useState(month);
  const currentYear = dayjs().year();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - 5 + index);

  const openPicker = () => {
    setDraftMonth(month);
    setIsVisible(true);
  };

  return (
    <>
      <button
        className="relative flex items-center border-0 bg-transparent p-0 text-font-black"
        data-testid={testId}
        onClick={openPicker}
        type="button"
      >
        <span className="font-number text-[26px] font-black leading-[39px] tracking-[-0.5px]">
          {month.format('YYYY')}
          <span className="font-sans text-[20px] font-bold leading-[30px]">年</span>
        </span>
        <span className="ml-1 font-number text-[20px] font-bold leading-[30px]">
          {month.format('MM')}
          <span className="font-sans">{monthLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            'ml-1 transition-transform duration-200 ease-in-out',
            isVisible && 'rotate-180',
          )}
          size={14}
          strokeWidth={2.5}
        />
      </button>
      <Popup
        bodyClassName="rounded-t-[24px] bg-[rgba(248,252,255,0.98)] pb-[calc(48px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(40,100,150,0.16)]"
        maskStyle={{ background: 'rgba(30, 50, 70, 0.35)' }}
        onMaskClick={() => setIsVisible(false)}
        position="bottom"
        visible={isVisible}
      >
        <div data-testid={testId ? `${testId}-sheet` : undefined}>
          <div className="flex justify-center pb-1 pt-3">
            <span className="h-1 w-9 rounded-sm bg-ww-ghost" />
          </div>
          <div className="flex items-center justify-between px-[22px] pb-4 pt-2">
            <strong className="text-[15px] font-bold leading-[22.5px] text-ww-ink">选择年月</strong>
            <button
              className="text-[13px] font-semibold leading-[19.5px] text-ww-soft"
              onClick={() => setIsVisible(false)}
              type="button"
            >
              关闭
            </button>
          </div>
          <div className="px-[18px] pb-[14px]" data-testid="record-year-options">
            <div className="mb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.6px] text-ww-soft">年份</div>
            <div className="grid grid-cols-4 gap-2">
              {years.map(year => (
                <button
                  className={cn(
                    'h-[34px] rounded-[10px] px-1 text-[13px] font-medium leading-[19.5px]',
                    draftMonth.year() === year
                      ? 'bg-[linear-gradient(156.176deg,#6fc2dc_0%,#4aaac4_100%)] font-extrabold text-white shadow-[0_3px_5px_rgba(74,170,200,0.35)]'
                      : 'bg-white/80 text-ww-mid',
                  )}
                  key={year}
                  onClick={() => setDraftMonth(draftMonth.year(year))}
                  type="button"
                >
                  {year}
                  年
                </button>
              ))}
            </div>
          </div>
          <div className="px-[18px]" data-testid="record-month-options">
            <div className="mb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.6px] text-ww-soft">月份</div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, index) => index).map((monthIndex) => {
                const isFuture = draftMonth.year() === currentYear && monthIndex > dayjs().month();
                return (
                  <button
                    className={cn(
                      'h-[42px] rounded-[12px] border border-solid text-[13px] font-medium leading-[19.5px]',
                      draftMonth.month() === monthIndex
                        ? 'border-transparent bg-[linear-gradient(152.211deg,#6fc2dc_0%,#4aaac4_100%)] font-extrabold text-white shadow-[0_3px_5px_rgba(74,170,200,0.35)]'
                        : 'border-border-primary bg-white/80 text-ww-mid shadow-ww-xs',
                      isFuture && 'opacity-35',
                    )}
                    disabled={isFuture}
                    key={monthIndex}
                    onClick={() => {
                      const nextMonth = draftMonth.month(monthIndex);
                      setDraftMonth(nextMonth);
                      onChange(nextMonth);
                      setIsVisible(false);
                    }}
                    type="button"
                  >
                    {monthIndex + 1}
                    月
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};
