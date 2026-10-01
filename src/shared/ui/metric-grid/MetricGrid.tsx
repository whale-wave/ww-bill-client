import type { MetricRowItem } from '@ww-bill/bill-ui';
import { fitMetricFontSize } from '@ww-bill/bill-core';
import { ChartSummaryMetrics, MetricRow } from '@ww-bill/bill-ui';
import { useLayoutEffect, useRef } from 'react';

export type { MetricTone } from '@ww-bill/bill-ui';
export type MetricGridItem = MetricRowItem;

export interface MetricGridProps {
  align?: 'center' | 'start';
  items: MetricGridItem[];
  columns?: 2 | 3;
  density?: 'chart' | 'compact' | 'hero' | 'standard';
  className?: string;
  variant?: 'chart-summary' | 'default' | 'detail-summary';
}

function ChartSummaryMetricGrid({ className, items }: { className: string; items: MetricGridItem[] }) {
  const gridRef = useRef<HTMLDListElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid)
      return;

    let active = true;
    const fitValues = () => {
      if (!active)
        return;

      const slots = Array.from(grid.querySelectorAll<HTMLElement>('[data-chart-metric-value]'));
      const values = Array.from(grid.querySelectorAll<HTMLElement>('[data-chart-metric-text]'));
      values.forEach(value => value.style.fontSize = '28px');

      const sharedSize = fitMetricFontSize(values.map((value, index) => ({
        availableWidth: slots[index]?.clientWidth ?? 0,
        naturalWidth: value.scrollWidth,
      })));
      values.forEach(value => value.style.fontSize = `${sharedSize}px`);
    };

    fitValues();
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(fitValues);
    resizeObserver?.observe(grid);
    window.addEventListener('resize', fitValues);
    void document.fonts?.ready.then(fitValues);

    return () => {
      active = false;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', fitValues);
    };
  }, [items]);

  return <ChartSummaryMetrics className={className} items={items} rootRef={gridRef} />;
}

export function MetricGrid({ align = 'center', items, columns = 3, density = 'standard', className = '', variant = 'default' }: MetricGridProps) {
  if (variant === 'detail-summary') {
    return <MetricRow className={className} columns={2} items={items} variant="detail-summary" />;
  }

  if (variant === 'chart-summary') {
    return <ChartSummaryMetricGrid className={className} items={items} />;
  }

  return <MetricRow align={align} className={`${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${className}`} columns={columns} density={density} items={items} />;
}
