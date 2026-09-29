import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomTabBarPresentation } from '@/shared/ui';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.replaceChildren();
});

function touch(target: EventTarget, type: string, clientX: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, pointerId: 1, pointerType: 'touch', isPrimary: true });
  target.dispatchEvent(event);
}

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

    const tabList = container.querySelector('nav[aria-label="Navigation"]');
    expect(tabList?.classList).toContain('fixed');
    expect(tabList?.classList).toContain('ww-floating-dock');
    expect(tabList?.classList).toContain('h-[68px]');
    expect(tabList?.classList).toContain('rounded-[34px]');
    expect(tabList?.classList).toContain('left-[14px]');
    expect(tabList?.classList).toContain('right-[14px]');
    expect(tabList?.querySelectorAll('button[data-tab-key]')).toHaveLength(count);
    expect(tabList?.querySelector('.ww-floating-dock__button--active')).not.toBeNull();
    expect(tabList?.getAttribute('data-active-index')).toBe('0');
    expect(tabList?.querySelector('.ww-floating-dock__active-indicator')).not.toBeNull();
    expect(tabList?.querySelector('.ww-floating-dock__create')).not.toBeNull();
    expect(tabList?.querySelector('.ww-tab-bar__button')?.className).not.toContain('transition-');
    expect(container.querySelector('.ww-tab-bar-spacer')).toBeNull();
  });

  it('selects the released destination once when dragging across real tab buttons', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const onSelect = Array.from({ length: 5 }, () => vi.fn());
    act(() => root.render(createElement(BottomTabBarPresentation, {
      activeKey: 'detail',
      ariaLabel: 'Main navigation',
      items: ['detail', 'chart', 'bookkeeping', 'discovery', 'mine'].map((key, index) => ({
        icon: key,
        key,
        label: key,
        onSelect: onSelect[index],
        prominent: key === 'bookkeeping',
      })),
    })));
    cleanup = () => act(() => root.unmount());
    const nav = container.querySelector('nav')!;
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 350 } as DOMRect);
    const first = nav.querySelector<HTMLButtonElement>('button[data-tab-key="detail"]')!;
    act(() => {
      touch(first, 'pointerdown', 35);
      touch(document, 'pointermove', 300);
      touch(document, 'pointerup', 315);
      first.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    });
    expect(onSelect[4]).toHaveBeenCalledOnce();
    expect(onSelect[0]).not.toHaveBeenCalled();
    expect(nav.getAttribute('data-ios-pressed')).toBe('false');
  });
});
