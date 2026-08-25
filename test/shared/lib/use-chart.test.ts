import type { Root } from 'react-dom/client';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChart } from '@/shared/lib/use-chart';

const chart = {
  dispatchAction: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('@/shared/lib/echarts', () => ({
  echarts: {
    getInstanceByDom: vi.fn(() => undefined),
    init: vi.fn(() => chart),
  },
}));

function Harness({ preventTouchMove }: { preventTouchMove?: boolean }) {
  const { chartDomRef } = useChart({ preventTouchMove });
  return createElement('div', { ref: chartDomRef });
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
});
