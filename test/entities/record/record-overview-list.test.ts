import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { RecordOverviewList } from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function render(variant?: 'overview' | 'search') {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(RecordOverviewList, {
    groups: [{
      dateLabel: '2026年07月21日',
      key: '2026-07-21',
      records: [{
        amount: '-20.00',
        iconName: 'food',
        id: 7,
        primary: 'Dinner',
        secondary: 'Avan · Shared',
      }],
      summaries: [{ key: 'expense', label: 'Expense', value: '20.00' }],
    }],
    variant,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('record overview list', () => {
  it('uses the original record search geometry by default', () => {
    const container = render();
    const list = container.querySelector('[data-testid="record-overview-list"]');
    const row = container.querySelector('[data-record-id="7"]');
    const iconCell = row?.querySelector('[data-category-icon="food"]');

    expect(list?.getAttribute('data-record-list-variant')).toBe('search');
    expect(row?.classList).toContain('h-[59px]');
    expect(iconCell?.classList).toContain('mx-4');
    expect(iconCell?.classList).toContain('py-3');
  });

  it('uses a roomier card row for overview pages', () => {
    const container = render('overview');
    const list = container.querySelector('[data-testid="record-overview-list"]');
    const row = container.querySelector('[data-record-id="7"]');

    expect(list?.getAttribute('data-record-list-variant')).toBe('overview');
    expect(row?.classList).toContain('h-[66px]');
    expect(row?.parentElement?.classList).toContain('rounded-[20px]');
  });
});
