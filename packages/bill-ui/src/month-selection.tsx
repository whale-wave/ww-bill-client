import type { ElementType, ReactNode } from 'react';
import './month-selection.scss';

export interface MonthSelectionOption {
  value: number;
  label: ReactNode;
  selected: boolean;
  disabled?: boolean;
}

/** Pure presentation: draft, validation and confirmation belong to hosts. */
export function MonthSelectionPanel({ title, closeLabel, yearLabel, monthLabel, years, months, onClose, onYear, onMonth, hint, action, primitives: { Box = 'div', Text = 'span', Button = 'button' } = {} }: {
  title: ReactNode;
  closeLabel: ReactNode;
  yearLabel: ReactNode;
  monthLabel: ReactNode;
  years: MonthSelectionOption[];
  months?: MonthSelectionOption[];
  onClose: () => void;
  onYear: (value: number) => void;
  onMonth?: (value: number) => void;
  hint?: ReactNode;
  action?: ReactNode;
  primitives?: { Box?: ElementType; Text?: ElementType; Button?: ElementType };
}) {
  const options = (items: MonthSelectionOption[], kind: 'year' | 'month', onSelect?: (value: number) => void) => (
    <Box className="bill-month-selection__grid">
      {items.map(item => <Button key={item.value} type="button" className={`bill-month-selection__option bill-month-selection__option--${kind}${item.selected ? ' ww-theme-primary-action bill-month-selection__option--selected' : ''}${item.disabled ? ' bill-month-selection__option--disabled' : ''}`} aria-pressed={item.selected} disabled={item.disabled} onClick={() => onSelect?.(item.value)}>{item.label}</Button>)}
    </Box>
  );
  return (
    <Box className="bill-month-selection">
      <Box className="bill-month-selection__heading">
        <Text className="bill-month-selection__title">{title}</Text>
        <Button type="button" className="bill-month-selection__close" onClick={onClose}>{closeLabel}</Button>
      </Box>
      <Box className="bill-month-selection__years" data-testid="record-year-options">
        <Text className="bill-month-selection__label">{yearLabel}</Text>
        {options(years, 'year', onYear)}
      </Box>
      {months && (
        <Box className="bill-month-selection__months" data-testid="record-month-options">
          <Text className="bill-month-selection__label">{monthLabel}</Text>
          {options(months, 'month', onMonth)}
        </Box>
      )}
      {action && (
        <Box className="bill-month-selection__footer">
          {hint && <Text className="bill-month-selection__hint" role="status">{hint}</Text>}
          {action}
        </Box>
      )}
    </Box>
  );
}
