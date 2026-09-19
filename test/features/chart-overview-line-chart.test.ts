import type { EChartsOption } from 'echarts';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CategoryTrendChart } from '@/features/chart-overview/ui/CategoryTrendChart';
import { LineChart } from '@/features/chart-overview/ui/LineChart';
import { PieChart } from '@/features/chart-overview/ui/PieChart';

const mocks = vi.hoisted(() => ({
  resize: vi.fn(),
  setOption: vi.fn(),
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({
    chartDomRef: { current: null },
    myChart: { resize: mocks.resize, setOption: mocks.setOption },
  }),
}));

vi.mock('@/features/chart-overview/model/chart-overview-context', () => ({
  useChartOverview: () => ({
    curTab: {
      amount: '20.00',
      average: '20.00',
      data: [{ amount: '20.00', data: [], value: '2026-07-21' }],
      key: 'current',
      name: 'Current',
      ranking: [],
    },
    currentAmountType: 'sub',
  }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  mocks.setOption.mockReset();
  mocks.resize.mockReset();
});

describe('chart overview line tooltip', () => {
  it('uses a compact canvas that fits beneath the chart summary', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(LineChart)));
    cleanup = () => act(() => root.unmount());

    const chartCanvas = container.firstElementChild;
    expect(chartCanvas?.classList).toContain('mt-[10px]');
    expect(chartCanvas?.classList).toContain('h-[80px]');
  });

  it('removes the ECharts tooltip shell behind the custom card', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(LineChart)));
    cleanup = () => act(() => root.unmount());

    const option = mocks.setOption.mock.calls[0]?.[0] as EChartsOption;
    const tooltip = option.tooltip as {
      backgroundColor?: string;
      borderWidth?: number;
      extraCssText?: string;
      padding?: number;
    };

    expect(tooltip.backgroundColor).toBe('transparent');
    expect(tooltip.borderWidth).toBe(0);
    expect(tooltip.padding).toBe(0);
    expect(tooltip.extraCssText).toContain('background: transparent');
    expect(tooltip.extraCssText).toContain('box-shadow: none');
  });

  it('renders the category trend as a line chart with a full option replacement', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryTrendChart, {
      records: [{ amount: '90.00', time: '2026-08-24T00:00:00.000Z' }],
    })));
    cleanup = () => act(() => root.unmount());

    const option = mocks.setOption.mock.calls[0]?.[0] as EChartsOption;
    const series = (option.series as Array<{ type?: string }>)[0];

    expect(series.type).toBe('line');
    expect(mocks.setOption).toHaveBeenCalledWith(option, { notMerge: true });
  });

  it('keeps the overview pie chart center amount adaptive and replaces its option', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(PieChart)));
    cleanup = () => act(() => root.unmount());

    const option = mocks.setOption.mock.calls[0]?.[0] as EChartsOption;
    const amount = container.querySelector('[data-donut-chart="overview"] .font-number') as HTMLElement;
    const donut = container.querySelector('[data-donut-chart="overview"]') as HTMLElement;

    expect(amount.textContent).toBe('¥20.00');
    expect(amount.style.fontSize).toBe('11px');
    expect(donut.classList).toContain('h-[88px]');
    expect(mocks.setOption).toHaveBeenCalledWith(option, { notMerge: true });
  });
});
