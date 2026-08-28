import type { EChartsOption } from 'echarts';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CategoryTrendChart, LineChart } from '@/features/chart-overview';

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
    expect(tooltip.extraCssText).toContain('background: transparent !important');
    expect(tooltip.extraCssText).toContain('box-shadow: none !important');
  });

  it('keeps the pie chart centered and stable while showing the category total', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryTrendChart, {
      displayMode: 'pie',
      records: [{ amount: '90.00', time: '2026-08-24T00:00:00.000Z' }],
    })));
    cleanup = () => act(() => root.unmount());

    const option = mocks.setOption.mock.calls[0]?.[0] as EChartsOption;
    const series = (option.series as Array<{ center?: string[]; emphasis?: { scale?: boolean }; radius?: string[] }>)[0];

    expect(series.center).toEqual(['50%', '50%']);
    expect(series.radius).toEqual(['46%', '74%']);
    expect(series.emphasis?.scale).toBe(false);
    expect(option.title).toBeUndefined();
    expect(container.textContent).toContain('¥90.00');
  });

  it('keeps a bounded legend and the complete centre total for many dates and large amounts', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryTrendChart, {
      displayMode: 'pie',
      records: [
        { amount: '120000000.00', time: '2026-08-01T00:00:00.000Z' },
        { amount: '90000000.00', time: '2026-08-02T00:00:00.000Z' },
        { amount: '80000000.00', time: '2026-08-03T00:00:00.000Z' },
        { amount: '70000000.00', time: '2026-08-04T00:00:00.000Z' },
        { amount: '60000000.00', time: '2026-08-05T00:00:00.000Z' },
      ],
    })));
    cleanup = () => act(() => root.unmount());

    const option = mocks.setOption.mock.calls[0]?.[0] as EChartsOption;
    const series = (option.series as Array<{ data: unknown[] }>)[0];
    expect(series.data).toHaveLength(4);
    expect(container.textContent).toContain('¥420000000.00');
  });
});
