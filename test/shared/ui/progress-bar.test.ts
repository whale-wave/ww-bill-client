import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProgressBar } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('progressBar', () => {
  it('uses responsive CSS percentages and clamps values to the supported range', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanup = () => act(() => root.unmount());

    act(() => root.render(createElement(ProgressBar, { percent: 0.25 })));
    const bar = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(bar.style.width).toBe('25%');
    expect(bar.style.minWidth).toBe('4px');

    act(() => root.render(createElement(ProgressBar, { percent: 2 })));
    expect(bar.style.width).toBe('100%');

    act(() => root.render(createElement(ProgressBar, { percent: -1 })));
    expect(bar.style.width).toBe('0%');
  });
});
