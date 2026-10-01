import type { Ref } from 'react';
import type { MetricRowItem, MetricRowPrimitives } from './metric-row';
import './chart-summary-metrics.scss';

export interface ChartSummaryMetricsProps<Element = unknown> {
  className?: string;
  id?: string;
  items: readonly MetricRowItem[];
  primitives?: MetricRowPrimitives;
  rootRef?: Ref<Element>;
  valueFontSize?: number;
}

export function ChartSummaryMetrics<Element = unknown>({ className = '', id, items, primitives = { Root: 'dl', Cell: 'div', Label: 'dt', Value: 'dd', Text: 'span' }, rootRef, valueFontSize = 28 }: ChartSummaryMetricsProps<Element>) {
  const { Root, Cell, Label, Value, Text } = primitives;
  return (
    <Root className={`bill-chart-metrics grid h-[62.5px] grid-cols-2 items-stretch ${className}`} id={id} ref={rootRef}>
      {items.map((item, index) => (
        <Cell className={`bill-chart-metrics__cell${index > 0 ? ' bill-chart-metrics__cell--divided border-l border-primary/25' : ''} min-w-0 px-5 text-left`} data-chart-metric data-metric-divider={index > 0 ? '' : undefined} key={item.key}>
          <Label className="bill-chart-metrics__label truncate text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">{item.label}</Label>
          <Value className={`bill-chart-metrics__value bill-chart-metrics__value--${item.tone ?? 'default'} mt-1 flex w-full min-w-0 items-baseline font-number`}>
            {item.suffix && <Text className="bill-chart-metrics__currency mr-1 shrink-0 text-[13px] font-bold leading-[19.5px] text-ww-mid" data-chart-currency>{item.suffix}</Text>}
            <Text className="bill-chart-metrics__slot block min-w-0 flex-1" data-chart-metric-value>
              <Text className="bill-chart-metrics__text inline-block max-w-none whitespace-nowrap text-[28px] font-black leading-[42px] tracking-[-1px]" data-chart-metric-text style={{ fontSize: `${valueFontSize}px` }}>{item.value}</Text>
            </Text>
          </Value>
        </Cell>
      ))}
    </Root>
  );
}
