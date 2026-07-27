import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import SearchTop from '@/pages/record/search-record/ui/Top';

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: React.ReactNode, initialEntry = pathname) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path: pathname },
    { element: createElement('div', null, 'detail-target'), path: '/detail' },
    { element: createElement('div', null, 'origin-target'), path: '/origin' },
  ], {
    initialEntries: ['/origin', initialEntry],
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
    const { container, router } = renderPage('/search-record', createElement(SearchTop), '/search-record?q=dinner');
    const input = container.querySelector('input');

    expect(document.activeElement).toBe(input);
    expect(container.querySelector('div.bg-primary.fixed')?.classList).toContain('fixed');
    expect(new URLSearchParams(router.state.location.search).get('q')).toBe('dinner');
    expect(input?.value).toBe('dinner');
    await act(async () => container.querySelector<HTMLElement>('.adm-search-bar-cancel-button')?.click());
    expect(router.state.location.pathname).toBe('/origin');
  });
});
