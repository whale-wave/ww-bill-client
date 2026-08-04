import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification';
import MessagePage from '@/pages/message/MessagePage';

const hooks = vi.hoisted(() => ({
  fetchNextPage: vi.fn(),
  markAllRead: vi.fn(),
  markRead: vi.fn(),
  refetch: vi.fn(),
  useMarkAllNotificationsReadMutation: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(),
  useNotificationsQuery: vi.fn(),
}));

const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    useMarkAllNotificationsReadMutation: hooks.useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation: hooks.useMarkNotificationReadMutation,
    useNotificationsQuery: hooks.useNotificationsQuery,
  };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/time', () => ({
  showDate: () => '4分钟前',
}));

vi.mock('@/shared/ui', () => ({
  NavBar: ({ children, right }: { children: ReactNode; right?: ReactNode }) => createElement(
    'header',
    null,
    children,
    right,
  ),
}));

vi.mock('antd-mobile', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => createElement('button', props, children),
  ErrorBlock: ({ title }: { title?: ReactNode }) => createElement('div', null, title),
  SpinLoading: () => createElement('div', null, 'loading'),
  Toast: { show: toastShow },
}));

const actionableNotification = {
  content: '分账本“报销账本”有一个新的加入申请，附言：“我是小勇”',
  createdAt: '2026-07-21T08:00:00.000Z',
  id: 'notification-1',
  joinRequestId: 'request/a',
  ledgerId: 'ledger/a',
  payload: {
    action: 'review',
    joinRequestId: 'request/a',
    ledgerId: 'ledger/a',
  },
  status: UserNotificationStatus.UNREAD,
  title: '鲸浪记账',
  type: UserNotificationType.LEDGER_JOIN_REQUEST,
  updatedAt: '2026-07-21T08:00:00.000Z',
  version: 2,
};

const passiveNotification = {
  ...actionableNotification,
  content: '账本成员信息已更新',
  id: 'notification-2',
  payload: {},
  status: UserNotificationStatus.READ,
  type: UserNotificationType.LEDGER_MEMBER_CHANGED,
  version: 1,
};

let cleanup: (() => void) | undefined;

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/message', element: createElement(MessagePage) },
    {
      path: '/ledgers/:ledgerId/join-requests/:requestId',
      element: createElement('div', null, 'request-target'),
    },
  ], { initialEntries: ['/message'] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  toastShow.mockReset();
  hooks.useNotificationsQuery.mockReturnValue({
    data: [actionableNotification, passiveNotification],
    fetchNextPage: hooks.fetchNextPage,
    hasNextPage: true,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: hooks.refetch,
  });
  hooks.useMarkNotificationReadMutation.mockReturnValue({
    isLoading: false,
    mutateAsync: hooks.markRead,
  });
  hooks.useMarkAllNotificationsReadMutation.mockReturnValue({
    isLoading: false,
    mutateAsync: hooks.markAllRead,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('message page', () => {
  it('renders the real notification feed without the former category hub', () => {
    const { container } = renderPage();

    expect(hooks.useNotificationsQuery).toHaveBeenCalledWith({ params: { limit: 20 } });
    expect(container.textContent).toContain('鲸浪记账');
    expect(container.textContent).toContain('4分钟前');
    expect(container.textContent).toContain('分账本“报销账本”有一个新的加入申请');
    expect(container.querySelector('[data-testid="message-notification-action-notification-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="message-notification-action-notification-2"]')).toBeNull();
    expect(container.querySelector('[data-unread="true"]')).not.toBeNull();
    expect(container.textContent).not.toContain('message.newFollow.title');
    expect(container.textContent).not.toContain('message.comment.title');
    expect(container.textContent).not.toContain('message.systemNotify.title');
  });

  it('marks an actionable unread notification read and opens its safe target', async () => {
    hooks.markRead.mockResolvedValue({ data: {} });
    const { container, router } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>(
        '[data-testid="message-notification-action-notification-1"]',
      )?.click();
      await Promise.resolve();
    });

    expect(hooks.markRead).toHaveBeenCalledWith({ id: 'notification-1', version: 2 });
    expect(router.state.location.pathname)
      .toBe('/ledgers/ledger%2Fa/join-requests/request%2Fa');
  });

  it('still opens the target if best-effort mark-read fails', async () => {
    hooks.markRead.mockRejectedValue(new Error('network failed'));
    const { container, router } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>(
        '[data-testid="message-notification-action-notification-1"]',
      )?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(router.state.location.pathname)
      .toBe('/ledgers/ledger%2Fa/join-requests/request%2Fa');
  });

  it('loads the next page and prevents duplicate mark-all submissions', async () => {
    hooks.fetchNextPage.mockResolvedValue({});
    let resolveMarkAll: (() => void) | undefined;
    hooks.markAllRead.mockReturnValue(new Promise<void>((resolve) => {
      resolveMarkAll = resolve;
    }));
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-load-more"]')?.click();
      await Promise.resolve();
    });
    expect(hooks.fetchNextPage).toHaveBeenCalledOnce();

    const markAllButton = container.querySelector<HTMLButtonElement>('[data-testid="message-read-all"]');
    await act(async () => {
      markAllButton?.click();
      markAllButton?.click();
      await Promise.resolve();
    });
    expect(hooks.markAllRead).toHaveBeenCalledOnce();

    await act(async () => resolveMarkAll?.());
  });
});
