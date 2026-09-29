import type { FC, ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

interface DonutChartProps {
  amount: string;
  amountSize: number;
  chart: ReactNode;
  compact?: boolean;
  label: string;
  legend: ReactNode;
  marker?: string;
}

/** Shared layout for every category donut: generous canvas, protected center, and a stable legend column. */
export const DonutChart: FC<DonutChartProps> = ({ amount, amountSize, chart, compact = false, label, legend, marker }) => {
  const amountRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const amountNode = amountRef.current;
    if (!compact || !amountNode)
      return;

    let active = true;
    const fitAmount = () => {
      if (!active)
        return;

      const baseSize = Math.min(amountSize, 11);
      amountNode.style.fontSize = `${baseSize}px`;
      const availableWidth = amountNode.parentElement?.clientWidth ?? 0;
      const naturalWidth = amountNode.scrollWidth;
      if (availableWidth > 0 && naturalWidth > availableWidth) {
        const fittedSize = Math.max(6, Math.floor((baseSize * availableWidth / naturalWidth) * 100) / 100);
        amountNode.style.fontSize = `${fittedSize}px`;
      }
    };

    fitAmount();
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(fitAmount);
    resizeObserver?.observe(amountNode.parentElement ?? amountNode);
    window.addEventListener('resize', fitAmount);
    void document.fonts?.ready.then(fitAmount);

    return () => {
      active = false;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', fitAmount);
    };
  }, [amount, amountSize, compact]);

  return (
    <div
      className={compact ? 'flex h-[88px] min-h-[88px] min-w-0 items-center gap-3' : 'flex min-h-[164px] min-w-0 items-center gap-4'}
      data-donut-chart={marker}
      data-tag-ranking-donut={marker === 'tag' ? true : undefined}
    >
      <div className={compact ? 'relative h-[100px] w-[100px] shrink-0' : 'relative h-[156px] w-[156px] shrink-0'}>
        <div className="h-full w-full">{chart}</div>
        <div className={compact
          ? 'pointer-events-none absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white/90 px-0.5 text-center shadow-[0_0_0_4px_rgba(255,255,255,0.18)]'
          : 'pointer-events-none absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white/90 px-1 text-center shadow-[0_0_0_6px_rgba(255,255,255,0.18)]'}
        >
          <span className={compact ? 'text-[9px] leading-3 text-ww-soft' : 'text-[11px] leading-4 text-ww-soft'}>{label}</span>
          <span
            className={`max-w-full overflow-hidden whitespace-nowrap font-number font-bold text-ww-ink ${compact ? 'leading-4' : 'leading-6'}`}
            ref={compact ? amountRef : undefined}
            style={{ fontSize: `${compact ? Math.min(amountSize, 11) : amountSize}px` }}
          >
            ¥
            {amount}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">{legend}</div>
    </div>
  );
};
