import type { PersonalTabKey } from '@/widgets/layout';
import { act, createElement, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/shared/ui';
import { PersonalTabSwipeNavigation, TabBar } from '@/widgets/layout';

vi.mock('@/shared/lib/play-sound', () => ({
  playSound: {
    turnPage: vi.fn(),
  },
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function dispatchPointer(
  element: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientX: number,
  clientY: number,
  pointerType = 'touch',
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: 0,
    clientX,
    clientY,
  });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: pointerType },
  });
  element.dispatchEvent(event);
}

function renderNavigation(initialPath: string) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const tabRoutes: Array<{ key?: PersonalTabKey; path: string }> = [
    { key: 'detail', path: '/detail' },
    { key: 'chart', path: '/chart' },
    { key: 'discovery', path: '/discovery' },
    { key: 'mine', path: '/mine' },
    { path: '/bookkeeping' },
  ];
  const pages = tabRoutes
    .filter((route): route is { key: Exclude<PersonalTabKey, 'bookkeeping'>; path: string } => Boolean(route.key))
    .map(({ key, path }) => ({
      content: createElement('div', { 'data-page': path }, path, createElement(TabBar, { activeKey: key })),
      key,
    }));
  const routes = tabRoutes.map(({ path }) => ({ element: createElement(Fragment), path }));
  const router = createMemoryRouter([{
    children: routes,
    element: createElement(PersonalTabSwipeNavigation, { pages }),
  }], { initialEntries: [initialPath] });
  act(() => root.render(createElement(MotionProvider, null, createElement(RouterProvider, { router }))));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

describe('personal tab swipe navigation', () => {
  it('swipes through the four non-prominent tabs in visual order', async () => {
    const { container, router } = renderNavigation('/detail');
    const swipeArea = container.querySelector('[data-personal-tab-swipe-navigation]');

    expect(swipeArea).not.toBeNull();
    expect(container.querySelectorAll('[role="tablist"]')).toHaveLength(1);
    expect(container.querySelector('[role="tablist"]')?.getAttribute('data-motion-enabled')).toBe('true');
    expect(container.querySelector('[data-personal-tab-track]')?.classList).toContain('inset-0');
    const pageSlots = Array.from(container.querySelectorAll<HTMLElement>('[data-personal-tab-page]'));
    expect(pageSlots).toHaveLength(4);
    expect(pageSlots.map(page => page.style.left)).toEqual(['', '', '', '']);
    expect(pageSlots.map(page => page.style.transform)).toEqual([
      'translate3d(0%, 0, 0)',
      'translate3d(100%, 0, 0)',
      'translate3d(200%, 0, 0)',
      'translate3d(300%, 0, 0)',
    ]);
    expect(container.querySelector('[data-page="/chart"]')).not.toBeNull();
    expect(container.querySelector('[data-personal-tab-page="detail"]')?.getAttribute('aria-hidden')).toBe('false');
    expect(container.querySelector('[data-personal-tab-page="chart"]')?.getAttribute('aria-hidden')).toBe('true');
    Object.defineProperty(swipeArea, 'clientWidth', { configurable: true, value: 400 });
    swipeArea!.scrollLeft = 120;
    const tabList = container.querySelector('[role="tablist"]')!;
    Object.defineProperty(tabList, 'clientWidth', { configurable: true, value: 510 });
    act(() => window.dispatchEvent(new Event('resize')));
    expect(swipeArea?.scrollLeft).toBe(0);
    await act(async () => {
      dispatchPointer(swipeArea!, 'pointerdown', 280, 100);
      dispatchPointer(swipeArea!, 'pointermove', 180, 104);
    });
    expect(container.querySelector<HTMLElement>('.ww-floating-dock__active-indicator')?.style.transform)
      .toContain('translate3d(25px, 0, 0) scaleX(1.015)');
    await act(async () => {
      swipeArea!.scrollLeft = 120;
      dispatchPointer(swipeArea!, 'pointerup', 180, 106);
    });
    expect(router.state.location.pathname).toBe('/chart');
    expect(swipeArea?.scrollLeft).toBe(0);
    expect(container.querySelectorAll('[role="tablist"]')).toHaveLength(1);
    expect(container.querySelector('[data-tab-key="chart"]')?.getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('[data-personal-tab-page="chart"]')?.getAttribute('aria-hidden')).toBe('false');

    const nextSwipeArea = container.querySelector('[data-personal-tab-swipe-navigation]');
    await act(async () => {
      dispatchPointer(nextSwipeArea!, 'pointerdown', 100, 100);
      dispatchPointer(nextSwipeArea!, 'pointermove', 160, 98);
      dispatchPointer(nextSwipeArea!, 'pointerup', 200, 95);
    });
    expect(router.state.location.pathname).toBe('/detail');
  });

  it('ignores short, vertical, mouse and nested horizontal-control gestures', async () => {
    const { container, router } = renderNavigation('/chart');
    const swipeArea = container.querySelector('[data-personal-tab-swipe-navigation]')!;
    const ignoredControl = document.createElement('div');
    ignoredControl.dataset.tabSwipeIgnore = '';
    swipeArea.append(ignoredControl);

    await act(async () => {
      dispatchPointer(swipeArea, 'pointerdown', 200, 100);
      dispatchPointer(swipeArea, 'pointerup', 160, 102);
      dispatchPointer(swipeArea, 'pointerdown', 220, 80);
      dispatchPointer(swipeArea, 'pointerup', 120, 200);
      dispatchPointer(swipeArea, 'pointerdown', 220, 100, 'mouse');
      dispatchPointer(swipeArea, 'pointerup', 120, 100, 'mouse');
      dispatchPointer(ignoredControl, 'pointerdown', 220, 100);
      dispatchPointer(ignoredControl, 'pointerup', 120, 100);
    });

    expect(router.state.location.pathname).toBe('/chart');
  });

  it('does not wrap at an edge or treat bookkeeping as a swipe tab', async () => {
    const mine = renderNavigation('/mine');
    const swipeArea = mine.container.querySelector('[data-personal-tab-swipe-navigation]')!;

    await act(async () => {
      dispatchPointer(swipeArea, 'pointerdown', 240, 100);
      dispatchPointer(swipeArea, 'pointerup', 120, 100);
    });
    expect(mine.router.state.location.pathname).toBe('/mine');

    cleanup?.();
    cleanup = undefined;
    const bookkeeping = renderNavigation('/bookkeeping');
    expect(bookkeeping.container.querySelector('[data-personal-tab-swipe-navigation]')).toBeNull();
  });
});
