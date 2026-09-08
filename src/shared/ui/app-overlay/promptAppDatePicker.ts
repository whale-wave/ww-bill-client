import type { DatePickerProps } from 'antd-mobile';
import { DatePicker } from 'antd-mobile';

export type AppDatePickerPromptProps = Omit<DatePickerProps, 'children' | 'value' | 'visible'>;

export function promptAppDatePicker({ className = '', ...props }: AppDatePickerPromptProps) {
  return DatePicker.prompt({
    ...props,
    className: `ww-app-date-picker ${className}`.trim(),
  });
}
