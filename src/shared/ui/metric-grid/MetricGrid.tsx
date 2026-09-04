import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

export type MetricTone = 'default' | 'income' | 'expense' | 'primary' | 'muted';

export interface MetricGridItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  suffix?: ReactNode;
  tone?: MetricTone;
}

export interface MetricGridProps {
  align?: 'center' | 'start';
  items: MetricGridItem[];
  columns?: 2 | 3;
  density?: 'chart' | 'compact' | 'hero' | 'standard';
  className?: string;
  variant?: 'chart-summary' | 'default' | 'detail-summary';
}

const toneClassNames: Record<MetricTone, string> = {
  default: 'text-ww-ink',
  income: 'text-finance-income',
  expense: 'text-finance-expense',
  primary: 'text-primary-deep',
  muted: 'text-ww-mid',
};

const densityClassNames = {
  chart: {
    label: 'text-[11px] font-semibold leading-[16.5px] tracking-[0.5px]',
    value: 'mt-1 text-[28px] font-black leading-[42px] tracking-[-1px]',
  },
  compact: {
    label: 'text-[10px] font-semibold leading-[15px]',
    value: 'mt-0.5 text-[13px] font-extrabold leading-[19.5px]',
  },
  hero: {
    label: 'text-[10px] font-semibold leading-[15px]',
    value: 'text-[22px] font-black leading-[33px]',
  },
  standard: {
    label: 'text-[11px] font-semibold leading-[16.5px] tracking-[0.5px]',
    value: 'mt-1 text-[16px] font-extrabold leading-6',
  },
};

function ChartMetricValue({ children }: { children: ReactNode }) {
  return (
    <span className="block min-w-0 flex-1" data-chart-metric-value>
      <span
        className="inline-block max-w-none whitespace-nowrap text-[28px] font-black leading-[42px] tracking-[-1px]"
        data-chart-metric-text
      >
        {children}
      </span>
    </span>
  );
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

      const fittedSizes = values.map((value, index) => {
        const availableWidth = slots[index]?.clientWidth ?? 0;
        const naturalWidth = value.scrollWidth;
        if (availableWidth <= 0 || naturalWidth <= availableWidth)
          return 28;
        return Math.max(1, Math.floor((28 * availableWidth / naturalWidth) * 100) / 100);
      });
      if (fittedSizes.length === 0)
        return;

      const sharedSize = Math.min(...fittedSizes);
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

  return (
    <dl className={`grid h-[62.5px] grid-cols-2 items-stretch ${className}`} ref={gridRef}>
      {items.map((item, index) => (
        <div
          className={`${index > 0 ? 'border-l border-primary/25' : ''} min-w-0 px-5 text-left`}
          data-chart-metric
          data-metric-divider={index > 0 ? '' : undefined}
          key={item.key}
        >
          <dt className="truncate text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">{item.label}</dt>
          <dd className={`mt-1 flex w-full min-w-0 items-baseline font-number ${toneClassNames[item.tone ?? 'default']}`}>
            {item.suffix && (
              <span className="mr-1 shrink-0 text-[13px] font-bold leading-[19.5px] text-ww-mid" data-chart-currency>
                {item.suffix}
              </span>
            )}
            <ChartMetricValue>{item.value}</ChartMetricValue>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MetricGrid({ align = 'center', items, columns = 3, density = 'standard', className = '', variant = 'default' }: MetricGridProps) {
  const densityClasses = densityClassNames[density];

  if (variant === 'detail-summary') {
    return (
      <dl className={`flex h-[57px] items-center gap-5 pt-[14px] ${className}`}>
        {items.map(item => (
          <div
            className="flex min-w-0 flex-1 flex-col items-start"
            key={item.key}
          >
            <dt className="w-full truncate text-[10.5px] font-semibold leading-[15.75px] tracking-[0.5px] text-ww-mid">{item.label}</dt>
            <dd className={`mt-[3px] flex h-6 min-w-0 items-baseline font-number text-[16px] font-extrabold leading-6 ${toneClassNames[item.tone ?? 'default']}`}>
              <span className="truncate">{item.value}</span>
              {item.suffix && <span className="text-xs font-normal text-ww-mid">{item.suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (variant === 'chart-summary') {
    return <ChartSummaryMetricGrid className={className} items={items} />;
  }

  return (
    <dl
      className={`grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${className}`}
    >
      {items.map((item, index) => (
        <div
          className={`min-w-0 px-2 ${align === 'center' ? 'text-center' : 'text-left'} ${index > 0 ? 'border-l border-primary/25' : ''}`}
          key={item.key}
        >
          <dt className={`truncate text-ww-mid ${densityClasses.label}`}>{item.label}</dt>
          <dd
            className={`flex min-w-0 items-baseline gap-0.5 font-number ${align === 'center' ? 'justify-center' : 'justify-start'} ${densityClasses.value} ${toneClassNames[item.tone ?? 'default']}`}
          >
            <span className="truncate">{item.value}</span>
            {item.suffix && <span className="text-xs font-normal text-ww-mid">{item.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
