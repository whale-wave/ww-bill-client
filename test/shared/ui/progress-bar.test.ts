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
  it('animates the shared fill and clamps values to the supported range', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanup = () => act(() => root.unmount());

    act(() => root.render(createElement(ProgressBar, { percent: 0.25 })));
    const bar = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(bar.style.transform).toBe('translateX(-75%)');
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('25');

    act(() => root.render(createElement(ProgressBar, { percent: 2 })));
    expect(bar.style.transform).toBe('translateX(-0%)');

    act(() => root.render(createElement(ProgressBar, { percent: -1 })));
    expect(bar.style.transform).toBe('translateX(-100%)');
  });
});
