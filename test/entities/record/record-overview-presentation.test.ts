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
    { icon: 'C', key: 'asset', label: 'Asset', onClick: vi.fn() },
  ],
};

describe('record overview presentation', () => {
  it('freezes the default ledger header geometry as the shared baseline', () => {
    const container = render(createElement(RecordOverviewHeader, headerProps));
    const header = container.querySelector('[data-record-overview-header]');
    const metrics = container.querySelector('[data-record-overview-metrics]');

    expect(header?.classList).toContain('h-[182px]');
    expect(header?.className).toContain('75%');
    expect(header?.className).toContain('89%');
    expect(metrics?.classList).toContain('top-[50px]');
    expect(container.querySelectorAll('nav button')).toHaveLength(3);
  });

  it('owns loading, empty, error and list states without page-specific layout', () => {
    const loading = render(createElement(RecordOverviewPresentation, {
      groups: [],
      header: headerProps,
      state: 'loading',
    }));
    expect(loading.querySelector('[data-record-overview-state="loading"]')).not.toBeNull();
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
    expect(content.querySelector('[data-record-overview-content]')).not.toBeNull();
  });
});
