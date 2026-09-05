import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification';
import SystemNotifyPage from '@/pages/system-notify/SystemNotifyPage';

const hooks = vi.hoisted(() => ({
  archive: vi.fn(),
  markAllRead: vi.fn(),
  markRead: vi.fn(),
  refetch: vi.fn(),
  useArchiveNotificationMutation: vi.fn(),
  useMarkAllNotificationsReadMutation: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(),
  useNotificationsQuery: vi.fn(),
}));

const dialogConfirm = vi.hoisted(() => vi.fn(async () => true));
const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    useArchiveNotificationMutation: hooks.useArchiveNotificationMutation,
    useMarkAllNotificationsReadMutation: hooks.useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation: hooks.useMarkNotificationReadMutation,
    useNotificationsQuery: hooks.useNotificationsQuery,
  };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  PageHeader: ({ title, right }: { title: ReactNode; right?: ReactNode }) => createElement(
    'header',
    null,
    title,
    right,
  ),
  IllustratedEmptyState: ({ title }: { title: ReactNode }) => createElement('div', null, title),
  PageLoadingState: ({ label, testId }: { label: ReactNode; testId?: string }) => createElement(
    'div',
    { 'data-testid': testId, 'role': 'status' },
    label,
  ),
}));

vi.mock('antd-mobile', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => createElement('button', props, children),
  Dialog: { confirm: dialogConfirm },
  Toast: { show: toastShow },
}));

const notification = {
  content: '请处理加入申请',
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
  title: '申请待处理',
  type: UserNotificationType.LEDGER_JOIN_REQUEST,
  updatedAt: '2026-07-21T08:00:00.000Z',
  version: 2,
};

let cleanup: (() => void) | undefined;

function renderPage(path = '/message/system-notify') {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/message/system-notify', element: createElement(SystemNotifyPage) },
    {
      path: '/ledgers/:ledgerId/join-requests/:requestId',
      element: createElement('div', null, 'request-target'),
    },
  ], { initialEntries: [path] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
  toastShow.mockReset();
  hooks.useNotificationsQuery.mockReturnValue({
    data: [notification],
    fetchNextPage: vi.fn(),
    hasNextPage: false,
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
  hooks.useArchiveNotificationMutation.mockReturnValue({
    isLoading: false,
    mutateAsync: hooks.archive,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('system notification center page', () => {
  it('uses URL filters and renders unread type, time, title, and content', () => {
    const { container } = renderPage(
      '/message/system-notify?status=UNREAD&type=LEDGER_JOIN_REQUEST',
    );

    expect(hooks.useNotificationsQuery).toHaveBeenCalledWith({
      params: {
        limit: 20,
        status: UserNotificationStatus.UNREAD,
        type: UserNotificationType.LEDGER_JOIN_REQUEST,
      },
    });
    expect(container.querySelector('[data-unread="true"]')).not.toBeNull();
    expect(container.textContent).toContain('申请待处理');
    expect(container.textContent).toContain('请处理加入申请');
    expect(container.textContent).toContain('types.LEDGER_JOIN_REQUEST');
    expect(container.querySelector('time')?.getAttribute('datetime'))
      .toBe(notification.createdAt);
  });

  it('marks one notification read and soft-archives it with its current version', async () => {
    hooks.markRead.mockResolvedValue({ data: {} });
    hooks.archive.mockResolvedValue({ data: {} });
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="notification-read-notification-1"]')?.click();
      await Promise.resolve();
    });
    expect(hooks.markRead).toHaveBeenCalledWith({ id: 'notification-1', version: 2 });

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="notification-delete-notification-1"]')?.click();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(dialogConfirm).toHaveBeenCalledOnce();
    expect(hooks.archive).toHaveBeenCalledWith({ id: 'notification-1', version: 2 });
  });

  it('prevents duplicate mark-all submissions while the first request is pending', async () => {
    let resolveMutation: (() => void) | undefined;
    hooks.markAllRead.mockReturnValue(new Promise<void>((resolve) => {
      resolveMutation = resolve;
    }));
    const { container } = renderPage();
    const markAllButton = container.querySelector<HTMLButtonElement>(
      '[data-testid="notification-read-all"]',
    );

    await act(async () => {
      markAllButton?.click();
      markAllButton?.click();
      await Promise.resolve();
    });
    expect(hooks.markAllRead).toHaveBeenCalledOnce();

    await act(async () => resolveMutation?.());
  });

  it('navigates only through the whitelisted notification target', async () => {
    const { container, router } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>(
        '[data-testid="notification-open-notification-1"]',
      )?.click();
    });

    expect(router.state.location.pathname)
      .toBe('/ledgers/ledger%2Fa/join-requests/request%2Fa');
  });
});
