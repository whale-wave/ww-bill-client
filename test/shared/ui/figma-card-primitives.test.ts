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
