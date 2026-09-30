import type { ElementType, ReactNode } from 'react';
import './metric-row.scss';

export type MetricTone = 'default' | 'income' | 'expense' | 'primary' | 'muted';

export interface MetricRowItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  suffix?: ReactNode;
  tone?: MetricTone;
}

export interface MetricRowPrimitives {
  Root: ElementType;
  Cell: ElementType;
  Label: ElementType;
  Value: ElementType;
  Text: ElementType;
}

export interface MetricRowProps {
  align?: 'center' | 'start';
  className?: string;
  columns?: 2 | 3;
  density?: 'chart' | 'compact' | 'hero' | 'standard';
  items: readonly MetricRowItem[];
  primitives?: MetricRowPrimitives;
}

const webPrimitives: MetricRowPrimitives = {
  Root: 'dl',
  Cell: 'div',
  Label: 'dt',
  Value: 'dd',
  Text: 'span',
};

export function MetricRow({
  align = 'center',
  className,
  columns = 3,
  density = 'standard',
  items,
  primitives = webPrimitives,
}: MetricRowProps) {
  const { Root, Cell, Label, Value, Text } = primitives;
  return (
    <Root className={`bill-metrics bill-metrics--${columns} bill-metrics--${density} bill-metrics--${align}${className ? ` ${className}` : ''}`}>
      {items.map((item, index) => (
        <Cell className={`bill-metrics__cell${index > 0 ? ' bill-metrics__cell--divided' : ''}`} key={item.key}>
          <Label className="bill-metrics__label">{item.label}</Label>
          <Value className={`bill-metrics__value bill-metrics__value--${item.tone ?? 'default'}`}>
            <Text className={`bill-metrics__number${item.valueClassName ? ` ${item.valueClassName}` : ''}`}>{item.value}</Text>
            {item.suffix && <Text className="bill-metrics__suffix">{item.suffix}</Text>}
          </Value>
        </Cell>
      ))}
    </Root>
  );
}
