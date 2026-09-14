import type { ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { cn } from '@/shared/lib';
import { AppSheet } from './AppSheet';

export type DatePickerPrecision = 'day' | 'hour' | 'minute' | 'month' | 'second' | 'year';
export type DatePickerUnit = 'day' | 'hour' | 'minute' | 'month' | 'second' | 'year';

export interface AppDatePickerProps {
  cancelText?: ReactNode;
  className?: string;
  confirmText?: ReactNode;
  defaultValue?: Date;
  max?: Date;
  min?: Date;
  onClose?: () => void;
  onConfirm?: (value: Date) => void;
  precision?: DatePickerPrecision;
  renderLabel?: (type: DatePickerUnit, value: number) => ReactNode;
  title?: ReactNode;
  value?: Date;
  visible?: boolean;
}

export interface AppDatePickerRef {
  close: () => void;
}

const unitOrder: DatePickerUnit[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

function range(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function clampDate(date: Date, min?: Date, max?: Date) {
  const time = Math.min(max?.getTime() ?? Number.POSITIVE_INFINITY, Math.max(min?.getTime() ?? Number.NEGATIVE_INFINITY, date.getTime()));
  return new Date(time);
}

export const AppDatePicker = forwardRef<AppDatePickerRef, AppDatePickerProps>(({
  cancelText = '取消',
  className,
  confirmText = '确定',
  defaultValue,
  max,
  min,
  onClose,
  onConfirm,
  precision = 'day',
  renderLabel,
  title = '选择日期',
  value,
  visible = false,
}, ref) => {
  const [draft, setDraft] = useState(() => clampDate(value ?? defaultValue ?? new Date(), min, max));
  useImperativeHandle(ref, () => ({ close: () => onClose?.() }), [onClose]);
  useEffect(() => {
    if (visible) {
      // Reset the uncontrolled draft whenever a new picker session opens.
      // eslint-disable-next-line react/set-state-in-effect
      setDraft(clampDate(value ?? defaultValue ?? new Date(), min, max));
    }
  }, [defaultValue, max, min, value, visible]);

  const visibleUnits = useMemo(() => unitOrder.slice(0, unitOrder.indexOf(precision) + 1), [precision]);
  const year = draft.getFullYear();
  const month = draft.getMonth() + 1;
  const options = useMemo<Record<DatePickerUnit, number[]>>(() => ({
    day: range(1, daysInMonth(year, month)),
    hour: range(0, 23),
    minute: range(0, 59),
    month: range(1, 12),
    second: range(0, 59),
    year: range(min?.getFullYear() ?? year - 100, max?.getFullYear() ?? year + 100),
  }), [max, min, month, year]);

  const readUnit = (unit: DatePickerUnit) => {
    if (unit === 'year')
      return draft.getFullYear();
    if (unit === 'month')
      return draft.getMonth() + 1;
    if (unit === 'day')
      return draft.getDate();
    if (unit === 'hour')
      return draft.getHours();
    if (unit === 'minute')
      return draft.getMinutes();
    return draft.getSeconds();
  };

  const updateUnit = (unit: DatePickerUnit, nextValue: number) => {
    const next = new Date(draft);
    const day = next.getDate();
    if (unit === 'year') {
      next.setDate(1);
      next.setFullYear(nextValue);
      next.setDate(Math.min(day, daysInMonth(next.getFullYear(), next.getMonth() + 1)));
    }
    else if (unit === 'month') {
      next.setDate(1);
      next.setMonth(nextValue - 1);
      next.setDate(Math.min(day, daysInMonth(next.getFullYear(), next.getMonth() + 1)));
    }
    else if (unit === 'day') {
      next.setDate(nextValue);
    }
    else if (unit === 'hour') {
      next.setHours(nextValue);
    }
    else if (unit === 'minute') {
      next.setMinutes(nextValue);
    }
    else {
      next.setSeconds(nextValue);
    }
    setDraft(clampDate(next, min, max));
  };

  return (
    <AppSheet
      bodyClassName={cn('adm-picker-popup ww-app-date-picker', className)}
      destroyOnClose
      onClose={onClose}
      onMaskClick={onClose}
      visible={visible}
    >
      <div className="adm-picker-header ww-app-date-picker__header">
        <button className="adm-picker-header-button" onClick={onClose} type="button">{cancelText}</button>
        <div className="adm-picker-header-title flex items-center gap-2">
          <CalendarDays aria-hidden size={17} strokeWidth={1.8} />
          <span>{title}</span>
        </div>
        <button className="adm-picker-header-button font-bold" onClick={() => onConfirm?.(draft)} type="button">{confirmText}</button>
      </div>
      <div className="adm-picker-view ww-app-date-picker__columns" style={{ gridTemplateColumns: `repeat(${visibleUnits.length}, minmax(0, 1fr))` }}>
        {visibleUnits.map(unit => (
          <label className="adm-picker-view-column ww-app-date-picker__column" key={unit}>
            <span className="sr-only">{unit}</span>
            <select
              aria-label={unit}
              className="ww-app-date-picker__select"
              onChange={event => updateUnit(unit, Number(event.target.value))}
              value={readUnit(unit)}
            >
              {options[unit].map(option => (
                <option key={option} value={option}>{renderLabel?.(unit, option) ?? (unit === 'year' ? option : String(option).padStart(2, '0'))}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </AppSheet>
  );
});
