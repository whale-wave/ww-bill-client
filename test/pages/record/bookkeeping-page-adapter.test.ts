import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookkeepingPage from '@/pages/record/bookkeeping/BookkeepingPage';

const hooks = vi.hoisted(() => ({
  postRecord: vi.fn(),
  putRecord: vi.fn(),
  useGetCategoryQuery: vi.fn(),
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useGetCategoryQuery: hooks.useGetCategoryQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  usePostRecordMutation: () => [hooks.postRecord, { isLoading: false }],
  usePutRecordMutation: () => [hooks.putRecord, { isLoading: false }],
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  Icon: ({ name }: { name: string }) => createElement('span', { 'data-icon': name }),
}));

let cleanup: (() => void) | undefined;

beforeEach(() => {
  hooks.postRecord.mockReset();
  hooks.putRecord.mockReset();
  hooks.useGetCategoryQuery.mockReset();
  hooks.postRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
  hooks.useGetCategoryQuery.mockReturnValue({
    data: [{
      createdAt: '',
      icon: 'food',
      id: 1,
      name: '餐饮',
      type: 'sub',
      updatedAt: '',
    }],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('personal record editor adapter', () => {
  it('uses selectTime for the draft and returns to the same calendar date after saving', async () => {
    const selectTime = new Date('2026-07-21T12:00:00.000Z').valueOf();
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
      { path: '/record-calendar', element: createElement('div', null, 'calendar') },
    ], { initialEntries: [`/bookkeeping?selectTime=${selectTime}`] });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '1')?.click());
    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.postRecord).toHaveBeenCalledWith(expect.objectContaining({
      amount: '1',
      categoryId: 1,
      remark: '餐饮',
      time: new Date(selectTime).toISOString(),
      type: 'sub',
    }));
    expect(router.state.location.pathname).toBe('/record-calendar');
    expect(router.state.location.search).toBe(`?selectTime=${selectTime}`);
  });

  it('returns a household-originated draft to the same household calendar', async () => {
    const selectTime = new Date('2026-07-21T12:00:00.000Z').valueOf();
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
      {
        path: '/households/:householdId/calendar',
        element: createElement('div', null, 'household-calendar'),
      },
    ], {
      initialEntries: [{
        pathname: '/bookkeeping',
        search: `?selectTime=${selectTime}`,
        state: {
          recordEditor: {
            returnContext: {
              householdId: 'household/a',
              kind: 'household-calendar',
              selectTime,
            },
          },
        },
      }],
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '1')?.click());
    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.postRecord).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/households/household%2Fa/calendar');
    expect(router.state.location.search).toBe(`?selectTime=${selectTime}`);
  });
});
