import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useChart } from '@/shared/lib/use-chart';

type ChartKind = 'pie' | 'line' | 'bar';

interface MonthBillChartProps {
  kind: ChartKind;
  option: EChartsOption;
  chartKey: string;
  onReady?: (chartKey: string) => void;
  className?: string;
  exportMode?: boolean;
}

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

export const MonthBillChart: FC<MonthBillChartProps> = ({ chartKey, className, exportMode = false, kind, onReady, option }) => {
  const { chartDomRef, myChart: chartInstance } = useChart();
  const [snapshotUrl, setSnapshotUrl] = useState<string>();
  const hasReportedReadyRef = useRef(false);

  useEffect(() => {
    if (!chartInstance)
      return;

    let cancelled = false;
    hasReportedReadyRef.current = false;
    chartInstance.clear();
    const handleFinished = () => {
      if (cancelled || hasReportedReadyRef.current)
        return;
      hasReportedReadyRef.current = true;
      chartInstance.off('finished', handleFinished);

      if (!exportMode) {
        onReady?.(chartKey);
        return;
      }

      try {
        setSnapshotUrl(chartInstance.getDataURL({ backgroundColor: 'transparent', pixelRatio: 2, type: 'png' }));
      }
      catch {
        onReady?.(chartKey);
      }
    };
    chartInstance.on('finished', handleFinished);

    const render = async () => {
      await nextFrame();
      await nextFrame();
      if (cancelled || !chartDomRef.current)
        return;

      const width = Math.max(1, Math.round(chartDomRef.current.getBoundingClientRect().width));
      const height = Math.max(1, Math.round(chartDomRef.current.getBoundingClientRect().height));
      chartInstance.resize({ height, silent: true, width });
      chartInstance.setOption({ animation: false, ...option }, true);
    };

    void render();

    const fallbackTimer = window.setTimeout(handleFinished, 1600);
    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      chartInstance.off('finished', handleFinished);
    };
  }, [chartInstance, chartKey, chartDomRef, exportMode, onReady, option]);

  return (
    <div className={`relative ${className ?? 'h-[150px] w-full'}`}>
      <div aria-label={`${kind} chart`} className={`absolute inset-0 ${snapshotUrl ? 'invisible' : ''}`} ref={chartDomRef} />
      {snapshotUrl && (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          data-chart-snapshot={chartKey}
          onLoad={() => onReady?.(chartKey)}
          src={snapshotUrl}
        />
      )}
    </div>
  );
};
