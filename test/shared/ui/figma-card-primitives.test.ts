import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionMenuCard,
  GradientPanel,
  MetricGrid,
  SettingsListCard,
} from '@/shared/ui';

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

describe('figma card primitives', () => {
  it('renders the selected surface and elevation', () => {
    const container = render(createElement(GradientPanel, { elevation: 'high', surface: 'blush' }, 'Budget'));
    expect(container.firstElementChild?.classList).toContain('rounded-[20px]');
    expect(container.firstElementChild?.classList).toContain('shadow-ww-lg');
    expect(container.firstElementChild?.className).toContain('#f8d8e8');
  });

  it('renders semantic metric values in a stable grid', () => {
    const container = render(createElement(MetricGrid, {
      columns: 2,
      items: [
        { key: 'income', label: 'Income', tone: 'income', value: '12.00' },
        { key: 'expense', label: 'Expense', tone: 'expense', value: '8.00' },
      ],
    }));
    expect(container.querySelector('dl')?.classList).toContain('grid-cols-2');
    expect(container.textContent).toContain('Income12.00');
    expect(container.textContent).toContain('Expense8.00');
  });

  it('renders the exact detail metric geometry and tones', () => {
    const container = render(createElement(MetricGrid, {
      columns: 2,
      items: [
        { key: 'income', label: 'Income', tone: 'income', value: '12.00' },
        { key: 'expense', label: 'Expense', tone: 'expense', value: '8.00' },
      ],
      variant: 'detail-summary',
    }));
    const values = container.querySelectorAll('dd');
    expect(values[0]?.className).toContain('#2a9460');
    expect(values[1]?.className).toContain('#c04870');
    expect(container.querySelector('[data-metric-divider]')?.classList).toContain('after:h-9');
  });

  it('renders the exact chart summary geometry and currency baseline', () => {
    const container = render(createElement(MetricGrid, {
      columns: 2,
      items: [
        { key: 'total', label: 'Total', suffix: '¥', value: '1234567890.12' },
        { key: 'average', label: 'Average', suffix: '¥', value: '1234567.89' },
      ],
      variant: 'chart-summary',
    }));
    const metrics = container.querySelectorAll('[data-chart-metric]');
    const grid = container.querySelector('dl');
    expect(grid?.classList).toContain('h-[62.5px]');
    expect(grid?.classList).toContain('grid-cols-2');
    expect(metrics[0]?.classList).toContain('text-left');
    expect(metrics[1]?.classList).toContain('border-l');
    expect(metrics[0]?.classList).toContain('px-5');
    expect(metrics[1]?.classList).toContain('px-5');
    expect(container.querySelector('[data-chart-currency]')?.classList).toContain('text-[13px]');
    const values = container.querySelectorAll('[data-chart-metric-value]');
    expect(values[0]?.textContent).toBe('1234567890.12');
    expect(values[1]?.textContent).toBe('1234567.89');
    expect(values[0]?.firstElementChild?.classList).not.toContain('truncate');
  });

  it('dispatches action menu callbacks', () => {
    const onClick = vi.fn();
    const container = render(createElement(ActionMenuCard, {
      items: [{ icon: 'A', key: 'asset', label: 'Asset', onClick }],
      variant: 'gradient-tiles',
    }));
    expect(container.firstElementChild?.classList).toContain('overflow-x-auto');
    act(() => container.querySelector('button')?.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders the exact detail shortcut tile', () => {
    const container = render(createElement(ActionMenuCard, {
      items: [{ icon: 'A', key: 'bill', label: 'Bill' }],
      variant: 'detail-shortcuts',
    }));
    const tile = container.querySelector('button');
    expect(tile?.classList).toContain('h-16');
    expect(tile?.classList).toContain('rounded-[14px]');
    expect(tile?.classList).toContain('gap-[5px]');
    expect(tile?.className).toContain('#e8f6ff');
  });

  it('spreads up to five detail shortcuts evenly without scrolling', () => {
    const container = render(createElement(ActionMenuCard, {
      items: Array.from({ length: 5 }, (_, index) => ({
        icon: String(index + 1),
        key: String(index + 1),
        label: `Action ${index + 1}`,
      })),
      variant: 'detail-shortcuts',
    }));
    const scroller = container.firstElementChild;
    const tiles = container.querySelectorAll('button');

    expect(scroller?.classList).not.toContain('snap-mandatory');
    expect(tiles).toHaveLength(5);
    expect(Array.from(tiles).every(tile => (
      tile.classList.contains('min-w-0')
      && tile.classList.contains('flex-1')
    ))).toBe(true);
  });

  it('keeps horizontal scrolling beyond five detail shortcuts', () => {
    const container = render(createElement(ActionMenuCard, {
      items: Array.from({ length: 6 }, (_, index) => ({
        icon: String(index + 1),
        key: String(index + 1),
        label: `Action ${index + 1}`,
      })),
      variant: 'detail-shortcuts',
    }));
    const scroller = container.firstElementChild;
    const tiles = container.querySelectorAll('button');

    expect(scroller?.classList).toContain('overflow-x-auto');
    expect(scroller?.classList).toContain('snap-mandatory');
    expect(tiles).toHaveLength(6);
    expect(Array.from(tiles).every(tile => (
      tile.classList.contains('w-[calc((100%_-_30px)/4)]')
      && tile.classList.contains('snap-start')
    ))).toBe(true);
  });

  it('supports interactive and informational setting rows', () => {
    const onClick = vi.fn();
    const container = render(createElement(SettingsListCard, {
      items: [
        { key: 'settings', label: 'Settings', onClick },
        { key: 'version', label: 'Version 1.0', showArrow: false },
      ],
    }));
    act(() => container.querySelector('button')?.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelectorAll('button')).toHaveLength(2);
  });
});
