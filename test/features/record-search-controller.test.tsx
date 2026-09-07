import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useRecordSearchController } from '@/features/record-search';

let cleanup: (() => void) | undefined;

function SearchStateProbe() {
  const search = useRecordSearchController({ wait: 0 });
  return createElement('div', null, createElement('span', { 'data-testid': 'keyword' }, search.value), createElement('button', { onClick: () => search.setValue('第二次'), type: 'button' }, '搜索'), createElement('button', {
    onClick: () => search.commitFilters({ ...search.filters, type: 'sub' }),
    type: 'button',
  }, '筛选'));
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record search controller', () => {
  it('replaces repeated search state so one back action returns to the origin page', async () => {
    const router = createMemoryRouter([
      { element: createElement('div', null, 'origin'), path: '/origin' },
      { element: createElement(SearchStateProbe), path: '/search-record' },
    ], {
      initialEntries: ['/origin', '/search-record?q=%E7%AC%AC%E4%B8%80%E6%AC%A1'],
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '搜索')?.click());
    expect(router.state.historyAction).toBe('REPLACE');
    expect(router.state.location.search).toBe('?q=%E7%AC%AC%E4%BA%8C%E6%AC%A1');

    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '筛选')?.click());
    expect(router.state.historyAction).toBe('REPLACE');

    await act(async () => router.navigate(-1));
    expect(router.state.location.pathname).toBe('/origin');
  });
});
