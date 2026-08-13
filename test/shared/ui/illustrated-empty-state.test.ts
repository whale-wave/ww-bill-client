import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IllustratedEmptyState } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('illustratedEmptyState', () => {
  it('renders reusable content and invokes its optional action', () => {
    const onAction = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(IllustratedEmptyState, {
      actionLabel: 'Create',
      description: 'Start by creating an item',
      icon: createElement('span', null, 'icon'),
      onAction,
      title: 'Nothing here',
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.textContent).toContain('Nothing here');
    expect(container.textContent).toContain('Start by creating an item');
    act(() => container.querySelector('button')?.click());
    expect(onAction).toHaveBeenCalledOnce();
  });
});
