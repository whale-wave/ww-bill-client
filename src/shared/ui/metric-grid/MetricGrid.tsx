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
}

const toneClassNames: Record<MetricTone, string> = {
  default: 'text-ww-ink',
  income: 'text-[#2a9460]',
  expense: 'text-[#d85f82]',
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

export function MetricGrid({ align = 'center', items, columns = 3, density = 'standard', className = '' }: MetricGridProps) {
  const densityClasses = densityClassNames[density];
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
