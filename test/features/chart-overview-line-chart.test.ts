import type { EChartsOption } from 'echarts';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LineChart } from '@/features/chart-overview';

const mocks = vi.hoisted(() => ({
  setOption: vi.fn(),
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({
    chartDomRef: { current: null },
    myChart: { setOption: mocks.setOption },
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
});
