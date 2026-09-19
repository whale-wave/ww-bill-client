import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RingChart } from '@/entities/budget/ui/RingChart';

const chart = vi.hoisted(() => ({
  setOption: vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
}));

vi.mock('@/shared/lib/appearance-tokens', () => ({
  readAppearanceToken: () => '#4aaac4',
  useAppearanceRevision: () => 0,
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({
    chartDomRef: { current: null },
    myChart: { setOption: chart.setOption },
  }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  chart.setOption.mockReset();
});

describe('budget ring chart', () => {
  it('does not render pie labels or connector lines', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(RingChart, { percentage: 11 })));
    cleanup = () => act(() => root.unmount());

    expect(chart.setOption).toHaveBeenCalledWith(expect.objectContaining({
      series: [expect.objectContaining({
        label: { show: false },
        labelLine: { show: false },
      })],
    }));
  });
});
