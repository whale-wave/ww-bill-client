import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaborationQueryState, LedgerUserAvatar } from '@/features/ledger-collaboration';

let cleanup: (() => void) | undefined;

function render(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledgerUserAvatar', () => {
  it('renders image avatars as fixed 1:1 circles that cannot shrink or stretch', () => {
    const container = render(createElement(LedgerUserAvatar, {
      size: 48,
      user: { avatar: 'https://cdn.example.com/u/1.png', id: 1, name: '阿蓝' },
    }));
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.classList.contains('rounded-full')).toBe(true);
    expect(img?.classList.contains('self-center')).toBe(true);
    expect((img as HTMLImageElement).style.width).toBe('48px');
    expect((img as HTMLImageElement).style.height).toBe('48px');
    expect((img as HTMLImageElement).style.minWidth).toBe('48px');
    expect((img as HTMLImageElement).style.minHeight).toBe('48px');
  });

  it('renders the initial-letter fallback with the same circular size rules', () => {
    const container = render(createElement(LedgerUserAvatar, {
      size: 42,
      user: { id: 2, username: 'wave' },
    }));
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    expect(span?.classList.contains('rounded-full')).toBe(true);
    expect((span as HTMLSpanElement).style.width).toBe('42px');
    expect((span as HTMLSpanElement).style.height).toBe('42px');
    expect((span as HTMLSpanElement).style.minWidth).toBe('42px');
    expect((span as HTMLSpanElement).style.minHeight).toBe('42px');
  });
});

describe('collaborationQueryState', () => {
  it.each(['empty', 'error', 'permission', 'invalid'] as const)(
    'replaces the legacy error block with the illustrated state for %s',
    (type) => {
      const container = render(createElement(CollaborationQueryState, {
        title: `${type}-title`,
        type,
      }));
      expect(container.querySelector('.adm-error-block')).toBeNull();
      expect(container.querySelector('h2')?.textContent).toBe(`${type}-title`);
    },
  );

  it('renders PageLoadingState for the loading state', () => {
    const container = render(createElement(CollaborationQueryState, {
      title: 'loading-title',
      type: 'loading',
    }));
    expect(container.querySelector('[data-testid="collaboration-loading"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(container.textContent).toContain('loading-title');
  });

  it('renders the retry action as an illustrated CTA for errors', () => {
    const onRetry = vi.fn();
    const container = render(createElement(CollaborationQueryState, {
      onRetry,
      retryLabel: 'retry-label',
      title: 'error-title',
      type: 'error',
    }));
    const retry = container.querySelector('button');
    expect(retry?.textContent).toBe('retry-label');
    act(() => retry?.click());
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
