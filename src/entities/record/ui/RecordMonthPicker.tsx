import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import { Popup } from 'antd-mobile';
import dayjs from 'dayjs';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { DesignIcon } from '@/shared/ui';

interface RecordMonthPickerProps {
  month: Dayjs;
  monthLabel?: ReactNode;
  onChange: (month: Dayjs) => void;
  precision?: 'month' | 'year';
  testId?: string;
  variant?: 'calendar' | 'compact' | 'detail';
}

export const RecordMonthPicker: FC<RecordMonthPickerProps> = ({
  month,
  monthLabel,
  onChange,
  precision = 'month',
  testId,
  variant = 'detail',
}) => {
  const { t } = useTranslation(['record', 'common']);
  const [isVisible, setIsVisible] = useState(false);
  const [draftMonth, setDraftMonth] = useState(month);
  const currentYear = dayjs().year();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - 5 + index);
  const isYearOnly = precision === 'year';

  const openPicker = () => {
    setDraftMonth(month);
    setIsVisible(true);
  };

  const handleSelectYear = (year: number) => {
    const nextMonth = draftMonth.year(year);
    setDraftMonth(nextMonth);
    if (isYearOnly) {
      onChange(nextMonth);
      setIsVisible(false);
    }
  };

  return (
    <>
      <button
        className={cn(
          'relative flex items-center border-0 text-font-black',
          variant === 'calendar'
            ? 'mx-auto h-10 min-w-0 justify-center gap-2 rounded-full border border-solid border-white/70 bg-white/70 px-4 text-[16px] font-extrabold tracking-[-0.02em] text-ww-ink shadow-ww-xs backdrop-blur-md transition active:scale-[0.98]'
            : variant === 'compact'
              ? 'h-8 gap-1 rounded-full border border-border-primary bg-white/55 px-3 font-number text-[13px] font-bold'
              : 'gap-[6px] bg-transparent p-0',
        )}
        data-testid={testId}
        onClick={openPicker}
        type="button"
      >
        {variant === 'calendar'
          ? (
              <>
                <CalendarDays className="shrink-0 text-primary-dark" size={18} />
                <span className="truncate">{month.format('YYYY / MM')}</span>
                <ChevronDown className="shrink-0 text-ww-soft" size={16} />
              </>
            )
          : variant === 'compact'
            ? (
                <span>
                  {month.format('YYYY')}
                  {t('common:dateTime.yearSuffix')}
                </span>
              )
            : (
                <>
                  <span className="font-number text-[26px] font-black leading-[39px]">
                    {month.format('YYYY')}
                    {t('common:dateTime.yearSuffix')}
                  </span>
                  {!isYearOnly && (
                    <span className="font-number text-[20px] font-bold leading-[30px] text-primary-deep">
                      {month.format('MM')}
                      {monthLabel}
                    </span>
                  )}
                </>
              )}
        {variant !== 'calendar' && <DesignIcon name="period-chevron" size={variant === 'compact' ? 12 : 14} />}
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
            <strong className="text-[15px] font-bold leading-[22.5px] text-ww-ink">
              {isYearOnly ? t('record:periodPicker.selectYear') : t('record:periodPicker.selectMonth')}
            </strong>
            <button
              className="text-[13px] font-semibold leading-[19.5px] text-ww-soft"
              onClick={() => setIsVisible(false)}
              type="button"
            >
              {t('common:nav.close')}
            </button>
          </div>
          <div className="px-[18px] pb-[14px]" data-testid="record-year-options">
            <div className="mb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.6px] text-ww-soft">
              {t('record:periodPicker.year')}
            </div>
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
                  onClick={() => handleSelectYear(year)}
                  type="button"
                >
                  {year}
                  {t('common:dateTime.yearSuffix')}
                </button>
              ))}
            </div>
          </div>
          {!isYearOnly && (
            <div className="px-[18px]" data-testid="record-month-options">
              <div className="mb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.6px] text-ww-soft">
                {t('record:periodPicker.month')}
              </div>
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
                      {t('common:dateTime.monthSuffix')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </>
  );
};
