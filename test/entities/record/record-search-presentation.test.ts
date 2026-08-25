import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordSearchPresentation } from '@/features/record-search';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
});

function render(state: 'error' | 'idle' | 'loading' | 'ready') {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(
    MemoryRouter,
    null,
    createElement(RecordSearchPresentation, {
      filters: {
        categoryIds: [],
        endDate: '',
        familyCounting: 'all',
        match: 'all',
        maxAmount: '',
        memberUserId: '',
        minAmount: '',
        startDate: '',
        tagIds: [],
        type: 'all',
      },
      groups: state === 'ready'
        ? [{
            dateLabel: '2026年07月30日',
            key: '2026-07-30',
            records: [{ amount: '-20.00', iconName: 'food', id: 1, primary: 'Dinner' }],
          }]
        : [],
      isFilterActive: false,
      onBack: vi.fn(),
      onFiltersConfirm: vi.fn(),
      onKeywordChange: vi.fn(),
      placeholder: 'Search',
      state,
      title: 'Search',
      validateFilters: () => ({}),
      value: 'Dinner',
    }),
  )));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('record search presentation', () => {
  it.each(['error', 'idle', 'loading'] as const)('owns the %s state geometry', (state) => {
    const container = render(state);
    expect(container.querySelector('[data-record-search-page-shell]')).not.toBeNull();
    expect(container.querySelector(`[data-record-search-state="${state}"]`)).not.toBeNull();
  });

  it('renders search results through the shared record list', () => {
    const container = render('ready');
    expect(container.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(container.querySelector('[data-record-list-variant="search"]')).not.toBeNull();
  });

  it('keeps search results in an independently scrollable flex region', () => {
    const container = render('ready');
    const shell = container.querySelector('[data-record-search-page-shell]');
    const scrollRegion = container.querySelector('main');

    expect(shell?.classList).toContain('fixed');
    expect(shell?.classList).toContain('inset-0');
    expect(shell?.classList).toContain('h-[100dvh]');
    expect(shell?.classList).toContain('min-h-0');
    expect(scrollRegion?.classList).toContain('h-0');
    expect(scrollRegion?.classList).toContain('flex-1');
    expect(scrollRegion?.classList).toContain('min-h-0');
    expect(scrollRegion?.classList).toContain('overflow-y-auto');
    expect(scrollRegion?.classList).toContain('overscroll-y-contain');
    expect(scrollRegion?.classList).toContain('touch-pan-y');
    expect(scrollRegion?.querySelector('[data-testid="record-overview-list"]')?.parentElement?.classList).toContain('shrink-0');
  });

  it('initializes custom dates from the local Shanghai calendar day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T16:30:00.000Z'));
    const container = render('idle');
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-filter-action"]')?.click());
    const customDate = [...container.querySelectorAll('button')]
      .find(button => button.textContent === '自定义');
    act(() => customDate?.click());
    expect(container.querySelector<HTMLInputElement>('[aria-label="开始日期"]')?.value)
      .toBe('2026-07-31');
  });
});
