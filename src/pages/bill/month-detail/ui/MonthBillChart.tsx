import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChart } from '@/shared/lib/use-chart';

type ChartKind = 'pie' | 'line' | 'bar';

interface MonthBillChartProps {
  kind: ChartKind;
  option: EChartsOption;
  chartKey: string;
  onReady?: (chartKey: string) => void;
  onError?: (chartKey: string, error: Error) => void;
  className?: string;
  exportMode?: boolean;
  enabled?: boolean;
  allowVerticalPageScroll?: boolean;
}

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

export const MonthBillChart: FC<MonthBillChartProps> = ({ allowVerticalPageScroll = false, chartKey, className, enabled = true, exportMode = false, kind, onError, onReady, option }) => {
  const { chartDomRef, myChart: chartInstance } = useChart({ preventTouchMove: !allowVerticalPageScroll });
  const [snapshotUrl, setSnapshotUrl] = useState<string>();
  const hasReportedTerminalRef = useRef(false);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const timeoutRef = useRef<number>();
  onErrorRef.current = onError;
  onReadyRef.current = onReady;
  const reportTerminal = useCallback((terminal: 'ready' | 'error', error?: Error) => {
    if (hasReportedTerminalRef.current)
      return;
    hasReportedTerminalRef.current = true;
    if (timeoutRef.current !== undefined)
      window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
    if (terminal === 'ready')
      onReadyRef.current?.(chartKey);
    else
      onErrorRef.current?.(chartKey, error ?? new Error(`Chart ${chartKey} failed`));
  }, [chartKey]);

  useEffect(() => {
    if (!enabled)
      return;
    let cancelled = false;
    hasReportedTerminalRef.current = false;

    const clearTimeoutIfNeeded = () => {
      if (timeoutRef.current !== undefined)
        window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    };
    const fail = (error: unknown) => {
      if (cancelled)
        return;
      reportTerminal('error', error instanceof Error ? error : new Error(String(error)));
    };
    timeoutRef.current = exportMode ? window.setTimeout(fail, 5000, new Error(`Chart ${chartKey} timed out`)) : undefined;

    if (!chartInstance) {
      return () => clearTimeoutIfNeeded();
    }

    chartInstance.clear();
    const handleFinished = () => {
      if (cancelled || hasReportedTerminalRef.current)
        return;
      chartInstance.off('finished', handleFinished);
      if (!exportMode) {
        reportTerminal('ready');
        return;
      }
      try {
        setSnapshotUrl(chartInstance.getDataURL({ backgroundColor: 'transparent', pixelRatio: 2, type: 'png' }));
      }
      catch (error) {
        fail(error);
      }
    };
    chartInstance.on('finished', handleFinished);

    const render = async () => {
      await nextFrame();
      await nextFrame();
      if (cancelled || !chartDomRef.current)
        return;
      try {
        const width = Math.max(1, Math.round(chartDomRef.current.getBoundingClientRect().width));
        const height = Math.max(1, Math.round(chartDomRef.current.getBoundingClientRect().height));
        chartInstance.resize({ height, silent: true, width });
        chartInstance.setOption({ animation: false, textStyle: { fontFamily: '"Noto Sans SC Variable", "Nunito Variable", sans-serif' }, ...option }, true);
      }
      catch (error) {
        fail(error);
      }
    };
    void render();

    return () => {
      cancelled = true;
      clearTimeoutIfNeeded();
      chartInstance.off('finished', handleFinished);
    };
  }, [chartInstance, chartKey, chartDomRef, enabled, exportMode, option, reportTerminal]);

  return (
    <div className={`relative ${className ?? 'h-[150px] w-full'}`} data-chart-placeholder={enabled ? undefined : chartKey}>
      <div aria-label={`${kind} chart`} className={`absolute inset-0 ${!enabled || snapshotUrl ? 'invisible' : ''}`} ref={chartDomRef} style={allowVerticalPageScroll ? { touchAction: 'pan-y' } : undefined} />
      {snapshotUrl && (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          data-chart-snapshot={chartKey}
          onError={() => reportTerminal('error', new Error(`Chart snapshot ${chartKey} failed to load`))}
          onLoad={() => reportTerminal('ready')}
          src={snapshotUrl}
        />
      )}
    </div>
  );
};
