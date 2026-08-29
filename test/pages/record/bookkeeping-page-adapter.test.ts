import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookkeepingPage from '@/pages/record/bookkeeping/BookkeepingPage';

const hooks = vi.hoisted(() => ({
  confirmShortcutDraft: vi.fn(),
  discardShortcutDraft: vi.fn(),
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

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useGetLedgersQuery: () => ({
    data: [{ capabilities: [], id: 'default-ledger', kind: 'SYSTEM_DEFAULT' }],
  }),
}));

vi.mock('@/entities/shortcut-bookkeeping', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/shortcut-bookkeeping')>()),
  useConfirmShortcutDraftMutation: () => ({
    isLoading: false,
    mutateAsync: hooks.confirmShortcutDraft,
  }),
  useDiscardShortcutDraftMutation: () => ({
    mutateAsync: hooks.discardShortcutDraft,
  }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/ui')>()),
  Icon: ({ name }: { name: string }) => createElement('span', { 'data-icon': name }),
}));

let cleanup: (() => void) | undefined;

function renderRouter(router: ReturnType<typeof createMemoryRouter>) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const queryClient = new QueryClient();
  act(() => root.render(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(RouterProvider, { router }),
  )));
  cleanup = () => act(() => root.unmount());
  return container;
}

beforeEach(() => {
  hooks.postRecord.mockReset();
  hooks.putRecord.mockReset();
  hooks.confirmShortcutDraft.mockReset();
  hooks.discardShortcutDraft.mockReset();
  hooks.useGetCategoryQuery.mockReset();
  hooks.postRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
  hooks.putRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
  hooks.confirmShortcutDraft.mockResolvedValue({ ledgerId: 'default-ledger', recordId: 11 });
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
    const container = renderRouter(router);

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

  it('opens the original editor with shortcut candidates and confirms through the draft endpoint', async () => {
    hooks.useGetCategoryQuery.mockReturnValue({
      data: [{
        createdAt: '',
        icon: 'traffic',
        id: 1,
        name: '交通',
        type: 'sub',
        updatedAt: '',
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
      { path: '/editing/:id', element: createElement('div', null, 'detail') },
    ], {
      initialEntries: [{
        pathname: '/bookkeeping',
        state: {
          shortcutBookkeeping: {
            amountCandidate: '18.60',
            capturedAt: '2026-08-29T10:00:00.000Z',
            expiresAt: '2026-08-30T10:00:00.000Z',
            id: 'shortcut-draft-1',
            merchantCandidate: '滴滴出行',
            rawText: '微信支付\\n滴滴出行\\n支付成功',
            reviewCode: 'review-code-00001',
            source: 'WECHAT',
            status: 'CLAIMED',
            warnings: [],
          },
        },
      }],
    });
    const container = renderRouter(router);

    await act(async () => Promise.resolve());
    expect(container.querySelector('[data-record-editor-presentation]')?.getAttribute('data-record-editor-stage')).toBe('amount');
    expect(container.querySelector<HTMLInputElement>('[data-record-editor-note] input')?.value).toBe('滴滴出行');
    expect(container.querySelector('[data-record-editor-category-trigger]')?.textContent).toBe('交通');
    expect(container.querySelector('[data-record-editor-total]')?.textContent).toContain('18.60');

    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.confirmShortcutDraft).toHaveBeenCalledWith(expect.objectContaining({
      amount: '18.6',
      categoryId: 1,
      code: 'review-code-00001',
      draftId: 'shortcut-draft-1',
      ledgerId: 'default-ledger',
      remark: '滴滴出行',
      type: 'sub',
    }));
    expect(hooks.postRecord).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe('/editing/11');
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
    const container = renderRouter(router);

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

  it('accepts the legacy raw record state and preserves its optimistic version', async () => {
    const legacyRecord = {
      amount: '20.00',
      category: {
        createdAt: '',
        icon: 'food',
        id: 1,
        name: '餐饮',
        updatedAt: '',
      },
      createdAt: '',
      id: 7,
      remark: '午餐',
      time: '2026-07-21T12:00:00.000Z',
      type: 'sub' as const,
      updatedAt: '',
      version: 3,
    };
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
      { path: '/editing/:id', element: createElement('div', null, 'detail') },
    ], {
      initialEntries: [{ pathname: '/bookkeeping', state: legacyRecord }],
    });
    const container = renderRouter(router);

    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.putRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: '20', version: 3 }),
      id: '7',
    });
    expect(router.state.location.pathname).toBe('/editing/7');
  });

  it('ignores malformed editor state and falls back to normal history cancellation', async () => {
    const router = createMemoryRouter([
      { path: '/origin', element: createElement('div', null, 'origin') },
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
    ], {
      initialEntries: [
        '/origin',
        {
          pathname: '/bookkeeping',
          state: { recordEditor: { returnContext: null } },
        },
      ],
    });
    const container = renderRouter(router);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-record-editor-cancel]')?.click();
    });

    expect(router.state.location.pathname).toBe('/origin');
  });

  it.each([
    [{ statusCode: 409 }, 'bookkeeping.conflict'],
    [{ statusCode: 500 }, 'bookkeeping.saveFailed'],
  ])('keeps an edited record open when saving fails with %j', async (error, message) => {
    const toast = vi.spyOn(Toast, 'show');
    hooks.putRecord.mockRejectedValue(error);
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
      { path: '/editing/:id', element: createElement('div', null, 'detail') },
    ], {
      initialEntries: [{
        pathname: '/bookkeeping',
        state: {
          amount: '20.00',
          category: {
            createdAt: '',
            icon: 'food',
            id: 1,
            name: '餐饮',
            updatedAt: '',
          },
          createdAt: '',
          id: 7,
          remark: '午餐',
          time: '2026-07-21T12:00:00.000Z',
          type: 'sub',
          updatedAt: '',
          version: 3,
        },
      }],
    });
    const container = renderRouter(router);

    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(router.state.location.pathname).toBe('/bookkeeping');
    expect(toast).toHaveBeenLastCalledWith(expect.objectContaining({ content: message }));
    toast.mockRestore();
  });

  it('treats an invalid selectTime as a normal current-date entry', async () => {
    const router = createMemoryRouter([
      { path: '/bookkeeping', element: createElement(BookkeepingPage) },
    ], { initialEntries: ['/bookkeeping?selectTime=not-a-date'] });
    const container = renderRouter(router);

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '1')?.click());
    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    const submittedTime = hooks.postRecord.mock.calls[0]?.[0]?.time;
    expect(Number.isNaN(new Date(submittedTime).valueOf())).toBe(false);
  });
});
