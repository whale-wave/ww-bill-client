import type { FC, ReactNode } from 'react';

interface DonutChartProps {
  amount: string;
  amountSize: number;
  chart: ReactNode;
  label: string;
  legend: ReactNode;
  marker?: string;
}

/** Shared layout for every category donut: generous canvas, protected center, and a stable legend column. */
export const DonutChart: FC<DonutChartProps> = ({ amount, amountSize, chart, label, legend, marker }) => (
  <div className="flex min-h-[164px] min-w-0 items-center gap-4" data-donut-chart={marker} data-tag-ranking-donut={marker === 'tag' ? true : undefined}>
    <div className="relative h-[156px] w-[156px] shrink-0">
      <div className="h-full w-full">{chart}</div>
      <div className="pointer-events-none absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white/90 px-1 text-center shadow-[0_0_0_6px_rgba(255,255,255,0.18)]">
        <span className="text-[11px] leading-4 text-ww-soft">{label}</span>
        <span className="max-w-full overflow-hidden whitespace-nowrap font-number font-bold leading-6 text-ww-ink" style={{ fontSize: `${amountSize}px` }}>
          ¥
          {amount}
        </span>
      </div>
    </div>
    <div className="min-w-0 flex-1">{legend}</div>
  </div>
);
