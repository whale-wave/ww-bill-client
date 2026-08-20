import type { ComponentType } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { PageLoadingState } from '@/shared/ui';

let cleanup: (() => void) | undefined;
function render(Component: ComponentType<any>, props?: Record<string, unknown>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(Component, props)));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('pageLoadingState', () => {
  it('renders role="status" so screen readers announce the loading state', () => {
    const container = render(PageLoadingState, { label: 'loading-text' });
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('renders the provided label', () => {
    const container = render(PageLoadingState, { label: '加载中...' });
    expect(container.textContent).toContain('加载中...');
  });

  it('uses the compact min-height when compact is set and the full height otherwise', () => {
    const compact = render(PageLoadingState, { compact: true, label: 'c' });
    expect(compact.querySelector('[class~="min-h-[160px]"]')).not.toBeNull();
    expect(compact.querySelector('[class~="min-h-[300px]"]')).toBeNull();

    const full = render(PageLoadingState, { label: 'f' });
    expect(full.querySelector('[class~="min-h-[300px]"]')).not.toBeNull();
    expect(full.querySelector('[class~="min-h-[160px]"]')).toBeNull();
  });

  it('forwards testId to data-testid', () => {
    const container = render(PageLoadingState, { label: 't', testId: 'recovery-loading' });
    expect(container.querySelector('[data-testid="recovery-loading"]')).not.toBeNull();
  });

  it('renders a custom ReactNode label', () => {
    const container = render(PageLoadingState, { label: createElement('strong', null, 'custom') });
    expect(container.querySelector('strong')?.textContent).toBe('custom');
  });
});
