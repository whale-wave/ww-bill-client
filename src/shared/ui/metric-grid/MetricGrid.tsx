import type { ReactNode } from 'react';

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
  income: 'text-[#2a9460]',
  expense: 'text-[#c04870]',
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

export function MetricGrid({ align = 'center', items, columns = 3, density = 'standard', className = '', variant = 'default' }: MetricGridProps) {
  const densityClasses = densityClassNames[density];

  if (variant === 'detail-summary') {
    return (
      <dl className={`flex h-[57px] items-center pt-[14px] ${className}`}>
        {items.map((item, index) => (
          <div
            className={`${index === 0 ? 'relative after:absolute after:-right-[17px] after:top-0 after:h-9 after:w-px after:bg-[rgba(100,160,200,0.25)]' : 'ml-[33px]'} flex w-[114px] min-w-0 flex-col items-start`}
            data-metric-divider={index === 0 ? '' : undefined}
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
    return (
      <dl className={`flex h-[62.5px] items-stretch ${className}`}>
        {items.map((item, index) => (
          <div
            className={`${index === 0 ? 'relative w-[95.422px] after:absolute after:-right-[29px] after:top-0 after:h-[62.5px] after:w-px after:bg-[rgba(100,160,200,0.22)]' : 'ml-[57px] w-[79.625px]'} min-w-0 text-left`}
            data-chart-metric
            data-metric-divider={index === 0 ? '' : undefined}
            key={item.key}
          >
            <dt className="truncate text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">{item.label}</dt>
            <dd className={`mt-1 flex min-w-0 items-baseline font-number ${toneClassNames[item.tone ?? 'default']}`}>
              {item.suffix && (
                <span className="mr-1 shrink-0 text-[13px] font-bold leading-[19.5px] text-ww-mid" data-chart-currency>
                  {item.suffix}
                </span>
              )}
              <span className="truncate text-[28px] font-black leading-[42px] tracking-[-1px]">{item.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={`grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${className}`}
    >
      {items.map((item, index) => (
        <div
          className={`min-w-0 px-2 ${align === 'center' ? 'text-center' : 'text-left'} ${index > 0 ? 'border-l border-[rgba(110,194,220,0.2)]' : ''}`}
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
