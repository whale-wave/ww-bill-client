import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import EditingTop from '@/pages/record/editing/Top';
import SearchTop from '@/pages/record/search-record/ui/Top';

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: React.ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path: pathname },
    { element: createElement('div', null, 'detail-target'), path: '/detail' },
    { element: createElement('div', null, 'origin-target'), path: '/origin' },
  ], {
    initialEntries: ['/origin', pathname],
    initialIndex: 1,
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('personal record auxiliary navigation', () => {
  it('focuses search automatically and cancel returns to the previous page', async () => {
    const { container, router } = renderPage('/search-record', createElement(SearchTop));
    const input = container.querySelector('input');

    expect(document.activeElement).toBe(input);
    await act(async () => container.querySelector<HTMLElement>('.adm-search-bar-cancel-button')?.click());
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('keeps the original editing return behavior for a persisted record', async () => {
    const state = {
      amount: '12',
      category: {
        createdAt: '2026-07-15T12:00:00.000Z',
        icon: 'food',
        id: 1,
        name: '餐饮',
        updatedAt: '2026-07-15T12:00:00.000Z',
      },
      createdAt: '2026-07-15T12:00:00.000Z',
      id: 7,
      remark: '午餐',
      status: true,
      time: '2026-07-15T12:00:00.000Z',
      type: 'sub' as const,
      updatedAt: '2026-07-15T12:00:00.000Z',
      version: 1,
    };
    const { container, router } = renderPage('/editing', createElement(EditingTop, { state }));

    await act(async () => container.querySelector<HTMLElement>('.bwm-nav-bar-back')?.click());
    expect(router.state.location.pathname).toBe('/detail');
  });
});
