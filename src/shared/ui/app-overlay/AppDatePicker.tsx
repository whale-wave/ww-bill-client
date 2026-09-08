import type { DatePickerProps, DatePickerRef } from 'antd-mobile';
import { DatePicker } from 'antd-mobile';
import { forwardRef } from 'react';

export type AppDatePickerProps = DatePickerProps;
export const AppDatePicker = forwardRef<DatePickerRef, AppDatePickerProps>((
  { className = '', ...props },
  ref,
) => {
  return <DatePicker className={`ww-app-date-picker ${className}`.trim()} ref={ref} {...props} />;
});
