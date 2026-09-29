import type { Root } from 'react-dom/client';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LineChart } from '@/features/chart-overview/ui/LineChart';
import { PieChart } from '@/features/chart-overview/ui/PieChart';
import { useChart } from '@/shared/lib/use-chart';

const chart = {
  dispatchAction: vi.fn(),
  dispose: vi.fn(),
  resize: vi.fn(),
  setOption: vi.fn(),
};

vi.mock('@/shared/lib/echarts', () => ({
  echarts: {
    getInstanceByDom: vi.fn(() => undefined),
    init: vi.fn(() => chart),
  },
}));

vi.mock('@/features/chart-overview/model/chart-overview-context', () => ({
  useChartOverview: () => ({
    curTab: {
      amount: '20.00',
      average: '20.00',
      data: [],
      ranking: [],
    },
    currentAmountType: 'sub',
  }),
}));

function Harness({ preventTouchMove }: { preventTouchMove?: boolean | 'horizontal' }) {
  const { chartDomRef } = useChart({ preventTouchMove });
  return createElement('div', { ref: chartDomRef });
}

function dispatchTouch(element: Element, type: 'touchmove' | 'touchstart', x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] });
  element.dispatchEvent(event);
  return event;
}

describe('useChart touch handling', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    chart.dispatchAction.mockClear();
    chart.dispose.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('keeps preventing touch movement by default', async () => {
    await act(async () => {
      root.render(createElement(Harness, {}));
      await Promise.resolve();
    });

    const event = new Event('touchmove', { cancelable: true });
    container.firstElementChild?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('allows vertical page scrolling when opted out', async () => {
    await act(async () => {
      root.render(createElement(Harness, { preventTouchMove: false }));
      await Promise.resolve();
    });

    const event = new Event('touchmove', { cancelable: true });
    container.firstElementChild?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('preserves horizontal chart gestures while allowing vertical scrolling', async () => {
    await act(async () => {
      root.render(createElement(Harness, { preventTouchMove: 'horizontal' }));
      await Promise.resolve();
    });

    const chartSurface = container.firstElementChild!;
    dispatchTouch(chartSurface, 'touchstart', 100, 100);
    expect(dispatchTouch(chartSurface, 'touchmove', 102, 60).defaultPrevented).toBe(false);
    dispatchTouch(chartSurface, 'touchstart', 100, 100);
    expect(dispatchTouch(chartSurface, 'touchmove', 140, 102).defaultPrevented).toBe(true);
  });

  it.each([
    ['line', LineChart, 'div'],
    ['pie', PieChart, '[data-chart-overview-pie]'],
  ])('allows vertical scrolling when a gesture starts on the overview %s chart', async (_kind, component, selector) => {
    await act(async () => {
      root.render(createElement(component));
      await Promise.resolve();
    });

    const chartSurface = container.querySelector(selector);
    expect(chartSurface).not.toBeNull();
    dispatchTouch(chartSurface!, 'touchstart', 100, 100);
    const event = dispatchTouch(chartSurface!, 'touchmove', 102, 60);
    expect(event.defaultPrevented).toBe(false);
  });
});
