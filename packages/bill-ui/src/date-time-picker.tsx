import type { ElementType, ReactNode } from 'react';
import './date-time-picker.scss';

export function DateTimePickerVisual({ title, cancel, confirm, wheels, primitives: { Box = 'div', Text = 'span' } = {} }: { title: ReactNode; cancel: ReactNode; confirm: ReactNode; wheels: ReactNode; primitives?: { Box?: ElementType; Text?: ElementType } }) {
  return (
    <Box className="bill-date-time-picker">
      <Box className="bill-date-time-picker__header">
        {cancel}
        <Text className="bill-date-time-picker__title">{title}</Text>
        {confirm}
      </Box>
      <Box className="bill-date-time-picker__wheel-frame">{wheels}</Box>
    </Box>
  );
}
