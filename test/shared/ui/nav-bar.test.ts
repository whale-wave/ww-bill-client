import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavBar } from '@/shared/ui/nav-bar/nav-bar';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let cleanup: (() => void) | undefined;

function renderNavBar(onBack?: () => void) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/sentinel', element: createElement('div', null, 'sentinel') },
    { path: '/target', element: createElement(NavBar, { onBack }, 'Target') },
  ], {
    initialEntries: ['/sentinel', '/target'],
    initialIndex: 1,
  });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());

  return { container, router };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('navBar', () => {
  it('navigates back one history entry when no custom handler is provided', async () => {
    const { container, router } = renderNavBar();
    const backButton = container.querySelector<HTMLElement>('.bwm-nav-bar-back');

    expect(backButton).not.toBeNull();
    await act(async () => backButton?.click());

    expect(router.state.location.pathname).toBe('/sentinel');
  });

  it('uses a custom back handler instead of navigating through history', async () => {
    const onBack = vi.fn();
    const { container, router } = renderNavBar(onBack);
    const backButton = container.querySelector<HTMLElement>('.bwm-nav-bar-back');

    await act(async () => backButton?.click());

    expect(onBack).toHaveBeenCalledOnce();
    expect(router.state.location.pathname).toBe('/target');
  });
});
