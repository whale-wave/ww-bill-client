import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomTabBarPresentation } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('bottom tab bar presentation', () => {
  it.each([2, 3, 5])('keeps the Figma floating presentation for %s adapter items', (count) => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(BottomTabBarPresentation, {
      activeKey: '0',
      ariaLabel: 'Navigation',
      items: Array.from({ length: count }, (_, index) => ({
        icon: String(index),
        key: String(index),
        label: `Tab ${index}`,
        onSelect: vi.fn(),
        prominent: index === 1,
      })),
    })));
    cleanup = () => act(() => root.unmount());

    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList?.classList).toContain('h-[66px]');
    expect(tabList?.classList).toContain('rounded-[33px]');
    expect(tabList?.classList).toContain('shadow-ww-floating');
    expect(tabList?.querySelectorAll('[role="tab"]')).toHaveLength(count);
  });
});
