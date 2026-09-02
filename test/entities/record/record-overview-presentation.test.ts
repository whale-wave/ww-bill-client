import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RecordOverviewHeader,
  RecordOverviewPresentation,
} from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => act(() => root.unmount());
  return container;
}

const headerProps = {
  metrics: [
    { key: 'income', label: 'Income', value: '12.00' },
    { key: 'expense', label: 'Expense', value: '8.00' },
  ] as const,
  period: { label: '2026年', value: '07月' },
  renderTitle: (className: string) => createElement('h1', { className }, 'Default ledger'),
  shortcuts: [
    { icon: 'A', key: 'bill', label: 'Bill', onClick: vi.fn() },
    { icon: 'B', key: 'budget', label: 'Budget', onClick: vi.fn() },
    { icon: 'C', key: 'search', label: 'Search', onClick: vi.fn() },
    { icon: 'D', key: 'calendar', label: 'Calendar', onClick: vi.fn() },
    { icon: 'E', key: 'settings', label: 'Settings', onClick: vi.fn() },
  ],
};

describe('record overview presentation', () => {
  it('uses the shared gradient summary and action layout', () => {
    const container = render(createElement(RecordOverviewHeader, {
      ...headerProps,
      titleIcon: createElement('img', { alt: '', src: '/ledger.svg' }),
    }));
    const header = container.querySelector('[data-record-overview-header]');
    const metrics = container.querySelector('[data-record-overview-metrics]');
    const titleRow = container.querySelector('[data-record-overview-title-row]');
    const shortcut = container.querySelector('[aria-label="record shortcuts"] button');

    expect(header?.classList).toContain('pt-[max(8px,env(safe-area-inset-top))]');
    expect(header?.querySelector('[data-record-overview-summary]')?.classList).toContain('h-[211px]');
    expect(titleRow?.classList).toContain('gap-2');
    expect(titleRow?.querySelector('img')?.parentElement?.classList).toContain('h-8');
    expect(shortcut?.classList).toContain('rounded-[14px]');
    expect(shortcut?.classList).toContain('h-16');
    expect(shortcut?.getAttribute('data-action-menu-variant')).toBe('detail-shortcuts');
    expect(shortcut?.getAttribute('data-action-menu-tone')).toBe('blue');
    expect(metrics).not.toBeNull();
    expect(container.querySelectorAll('[aria-label="record shortcuts"] button')).toHaveLength(5);
  });

  it('keeps horizontal shortcut scrolling after class merge beyond five items', () => {
    const container = render(createElement(RecordOverviewHeader, {
      ...headerProps,
      shortcuts: [
        ...headerProps.shortcuts,
        { icon: 'F', key: 'members', label: 'Members', onClick: vi.fn() },
      ],
    }));
    const shortcutCard = container.querySelector('[aria-label="record shortcuts"]');

    expect(shortcutCard?.classList).toContain('overflow-x-auto');
    expect(shortcutCard?.classList).toContain('overflow-y-hidden');
    expect(shortcutCard?.classList).not.toContain('overflow-hidden');
    expect(container.querySelectorAll('[aria-label="record shortcuts"] button')).toHaveLength(6);
  });

  it('owns loading, empty, error and list states without page-specific layout', () => {
    const loading = render(createElement(RecordOverviewPresentation, {
      groups: [],
      header: headerProps,
      state: 'loading',
    }));
    const loadingState = loading.querySelector('[data-testid="record-overview-loading"]');
    expect(loadingState?.getAttribute('role')).toBe('status');
    expect(loadingState?.classList).toContain('min-h-[160px]');
    cleanup?.();
    cleanup = undefined;

    const content = render(createElement(RecordOverviewPresentation, {
      emptyDescription: 'Nothing here',
      groups: [{
        dateLabel: 'July 30',
        key: '2026-07-30',
        records: [{
          amount: '-8.00',
          iconName: 'food',
          id: 1,
          primary: 'Lunch',
        }],
      }],
      header: headerProps,
      state: 'ready',
    }));
    expect(content.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(content.querySelector('[data-record-overview-tab-bar-spacer]')?.classList)
      .toContain('h-[calc(126px+env(safe-area-inset-bottom))]');
  });

  it('uses the shared illustrated empty state and forwards its primary action', () => {
    const onEmptyAction = vi.fn();
    const container = render(createElement(RecordOverviewPresentation, {
      emptyActionLabel: 'Add a transaction',
      emptyDescription: 'Your monthly records will appear here',
      emptyTitle: 'No records this month',
      groups: [],
      header: headerProps,
      onEmptyAction,
      state: 'ready',
    }));

    expect(container.querySelector('[data-testid="record-overview-empty-state"]')).not.toBeNull();
    expect(container.textContent).toContain('No records this month');
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-overview-empty-state"] button')?.click());
    expect(onEmptyAction).toHaveBeenCalledOnce();
  });

  it('uses the compact load-more action and exposes its busy state', () => {
    const onLoadMore = vi.fn();
    const container = render(createElement(RecordOverviewPresentation, {
      groups: [{
        dateLabel: 'July 30',
        key: '2026-07-30',
        records: [{
          amount: '-8.00',
          iconName: 'food',
          id: 1,
          primary: 'Lunch',
        }],
      }],
      hasMore: true,
      header: headerProps,
      isLoadingMore: true,
      loadMoreLabel: 'Load more',
      loadMoreTestId: 'record-overview-load-more',
      onLoadMore,
      state: 'ready',
    }));
    const button = container.querySelector<HTMLButtonElement>('[data-testid="record-overview-load-more"]');

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelector('[data-record-overview-load-more]')?.classList).toContain('py-3');
    expect(button?.classList).toContain('h-12');
    expect(button?.classList).toContain('py-0');
    expect(button?.classList).toContain('leading-5');
    expect(button?.classList).toContain('w-full');
    expect(button?.classList).toContain('rounded-[16px]');
    expect(button?.classList).toContain('text-[13px]');
    expect(button?.classList).toContain('shadow-ww-xs');
    expect(button?.classList).not.toContain('mx-3');
    expect(button?.textContent).toMatch(/加载中|Loading/);
    act(() => button?.click());
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('keeps the load-more action disabled when no further page exists', () => {
    const container = render(createElement(RecordOverviewPresentation, {
      groups: [{
        dateLabel: 'July 30',
        key: '2026-07-30',
        records: [{
          amount: '-8.00',
          iconName: 'food',
          id: 1,
          primary: 'Lunch',
        }],
      }],
      hasMore: false,
      header: headerProps,
      loadMoreLabel: 'Load more',
      loadMoreTestId: 'record-overview-load-more',
      state: 'ready',
    }));
    const button = container.querySelector<HTMLButtonElement>('[data-testid="record-overview-load-more"]');

    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBeNull();
    expect(button?.textContent).toBe('Load more');
  });

  it('uses the shared illustrated error state and forwards retry', () => {
    const onRetry = vi.fn();
    const container = render(createElement(RecordOverviewPresentation, {
      errorDescription: 'Check your connection and try again',
      errorTitle: 'Unable to load records',
      groups: [],
      header: headerProps,
      onRetry,
      retryLabel: 'Try again',
      state: 'error',
    }));

    const errorState = container.querySelector('[data-record-overview-state="error"]');
    expect(errorState).not.toBeNull();
    expect(container.querySelector('[data-testid="record-overview-error-state"]')).not.toBeNull();
    expect(container.querySelector('[data-design-icon="tab-detail-active"]')).toBeNull();
    expect(container.textContent).toContain('Unable to load records');
    expect(container.textContent).toContain('Check your connection and try again');
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-overview-error-state"] button')?.click());
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
