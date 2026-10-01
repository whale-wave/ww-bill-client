import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import { MonthSelectionPanel, PeriodLabel } from '@ww-bill/bill-ui';
import dayjs from 'dayjs';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { AppButton, AppSheet, DesignIcon } from '@/shared/ui';

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
  const isDraftMonthInFuture = draftMonth.isAfter(dayjs(), 'month');

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

  const handleConfirm = () => {
    if (isDraftMonthInFuture)
      return;
    onChange(draftMonth);
    setIsVisible(false);
  };

  return (
    <>
      <button
        className={cn(
          'relative flex min-h-11 items-center border-0 text-font-black',
          variant === 'calendar'
            ? 'mx-auto h-11 min-w-0 justify-center gap-2 rounded-full border border-solid border-white/70 bg-white/70 px-4 text-[16px] font-extrabold tracking-[-0.02em] text-ww-ink shadow-ww-xs backdrop-blur-md transition active:scale-[0.98]'
            : variant === 'compact'
              ? 'h-11 gap-1 rounded-full border border-border-primary bg-white/55 px-3 font-number text-[13px] font-bold'
              : 'bill-month-picker-trigger ww-summary-period min-w-0',
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
                <PeriodLabel year={month.format('YYYY')} yearSuffix={t('common:dateTime.yearSuffix')} month={isYearOnly ? undefined : month.format('MM')} monthSuffix={monthLabel} />
              )}
        {variant !== 'calendar' && <DesignIcon name="period-chevron" size={variant === 'compact' ? 12 : 14} />}
      </button>
      <AppSheet
        onMaskClick={() => setIsVisible(false)}
        visible={isVisible}
      >
        <div data-testid={testId ? `${testId}-sheet` : undefined}>
          <MonthSelectionPanel
            title={isYearOnly ? t('record:periodPicker.selectYear') : t('record:periodPicker.selectMonth')}
            closeLabel={t('common:nav.close')}
            yearLabel={t('record:periodPicker.year')}
            monthLabel={t('record:periodPicker.month')}
            onClose={() => setIsVisible(false)}
            onYear={handleSelectYear}
            onMonth={month => setDraftMonth(draftMonth.month(month))}
            years={years.map(year => ({ value: year, label: `${year}${t('common:dateTime.yearSuffix')}`, selected: draftMonth.year() === year }))}
            months={isYearOnly ? undefined : Array.from({ length: 12 }, (_, month) => ({ value: month, label: `${month + 1}${t('common:dateTime.monthSuffix')}`, selected: draftMonth.month() === month, disabled: draftMonth.year() === currentYear && month > dayjs().month() }))}
            hint={isDraftMonthInFuture ? t('record:periodPicker.futureMonthHint') : undefined}
            action={isYearOnly ? undefined : <AppButton data-testid="record-month-confirm" disabled={isDraftMonthInFuture} fullWidth onClick={handleConfirm}>{t('common:nav.confirm')}</AppButton>}
          />
        </div>
      </AppSheet>
    </>
  );
};
