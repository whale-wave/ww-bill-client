import type { Root } from 'react-dom/client';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MonthBillChart } from '@/pages/bill/month-detail/ui/MonthBillChart';

const chart = vi.hoisted(() => ({
  clear: vi.fn(),
  getDataURL: vi.fn(() => 'data:image/png;base64,chart'),
  off: vi.fn(),
  on: vi.fn(),
  resize: vi.fn(),
  setOption: vi.fn(),
}));

vi.mock('@/shared/lib/use-chart', async () => {
  const { useRef } = await import('react');
  return {
    useChart: () => ({ chartDomRef: useRef<HTMLDivElement>(null), myChart: chart }),
  };
});

describe('monthBillChart export lifecycle', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    chart.clear.mockClear();
    chart.getDataURL.mockClear();
    chart.off.mockClear();
    chart.on.mockClear();
    chart.resize.mockClear();
    chart.setOption.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps the chart mount point available before export charts are enabled', () => {
    act(() => root.render(createElement(MonthBillChart, {
      chartKey: 'expense-pie',
      enabled: false,
      exportMode: true,
      kind: 'pie',
      option: {},
    })));

    expect(container.querySelector('[data-chart-placeholder="expense-pie"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="pie chart"]')).not.toBeNull();
  });

  it('completes a chart snapshot after export charts are enabled', async () => {
    const onReady = vi.fn();
    const renderChart = (enabled: boolean) => createElement(MonthBillChart, {
      chartKey: 'expense-pie',
      enabled,
      exportMode: true,
      kind: 'pie' as const,
      onReady,
      option: {},
    });

    act(() => root.render(renderChart(false)));
    await act(async () => {
      root.render(renderChart(true));
      await Promise.resolve();
      await Promise.resolve();
    });
    const finishedHandler = chart.on.mock.calls.find(([event]) => event === 'finished')?.[1];

    expect(chart.setOption).toHaveBeenCalledOnce();
    expect(finishedHandler).toBeTypeOf('function');
    act(() => finishedHandler?.());
    const image = container.querySelector<HTMLImageElement>('[data-chart-snapshot="expense-pie"]');
    expect(image).not.toBeNull();
    act(() => image?.dispatchEvent(new Event('load')));
    expect(onReady).toHaveBeenCalledWith('expense-pie');
  });

  it('does not restart chart rendering when the parent supplies a new callback', async () => {
    const option = {};
    const renderChart = (onReady: (chartKey: string) => void) => createElement(MonthBillChart, {
      chartKey: 'expense-pie',
      exportMode: true,
      kind: 'pie' as const,
      onReady,
      option,
    });

    await act(async () => {
      root.render(renderChart(vi.fn()));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      root.render(renderChart(vi.fn()));
      await Promise.resolve();
    });

    expect(chart.on).toHaveBeenCalledOnce();
  });

  it('reports a failed chart snapshot only once', async () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    await act(async () => {
      root.render(createElement(MonthBillChart, {
        chartKey: 'expense-pie',
        exportMode: true,
        kind: 'pie',
        onError,
        option: {},
      }));
      await Promise.resolve();
      await Promise.resolve();
    });
    const finishedHandler = chart.on.mock.calls.find(([event]) => event === 'finished')?.[1];

    act(() => finishedHandler?.());
    const image = container.querySelector<HTMLImageElement>('[data-chart-snapshot="expense-pie"]');
    act(() => image?.dispatchEvent(new Event('error')));
    act(() => vi.advanceTimersByTime(5000));

    expect(onError).toHaveBeenCalledOnce();
  });
});
