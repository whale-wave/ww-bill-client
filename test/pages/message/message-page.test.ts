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
  archive: vi.fn(),
  fetchNextPage: vi.fn(),
  markRead: vi.fn(),
  refetch: vi.fn(),
  useArchiveNotificationsMutation: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(),
  useNotificationsQuery: vi.fn(),
}));

const dialogConfirm = vi.hoisted(() => vi.fn(async () => true));
const showAppError = vi.hoisted(() => vi.fn());

let intersectionCallback: IntersectionObserverCallback | undefined;

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  disconnect() {}

  observe() {}

  unobserve() {}
}

vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    useArchiveNotificationsMutation: hooks.useArchiveNotificationsMutation,
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

vi.mock('@/shared/ui/app-feedback', () => ({ showAppError }));

vi.mock('@/shared/ui', () => ({
  AppButton: ({ children, ...props }: { children: ReactNode }) => createElement('button', props, children),
  confirmAppAction: dialogConfirm,
  PageHeader: ({ right, title }: { right?: ReactNode; title: ReactNode }) => createElement(
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
  showAppActionSheet: vi.fn(),
  showAppInfoDialog: vi.fn(),
}));

vi.mock('antd-mobile', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => createElement('button', props, children),
  ErrorBlock: ({ title }: { title?: ReactNode }) => createElement('div', null, title),
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

let renderedNotifications = [actionableNotification, passiveNotification];
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
  const rerender = () => act(() => root.render(createElement(RouterProvider, { router })));
  rerender();
  cleanup = () => act(() => root.unmount());
  return { container, rerender, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
  showAppError.mockReset();
  intersectionCallback = undefined;
  renderedNotifications = [actionableNotification, passiveNotification];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  hooks.useNotificationsQuery.mockImplementation(() => ({
    data: renderedNotifications,
    fetchNextPage: hooks.fetchNextPage,
    hasNextPage: true,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: hooks.refetch,
  }));
  hooks.useMarkNotificationReadMutation.mockReturnValue({
    isLoading: false,
    mutateAsync: hooks.markRead,
  });
  hooks.useArchiveNotificationsMutation.mockReturnValue({
    isLoading: false,
    mutateAsync: hooks.archive,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('message page', () => {
  it('renders the real notification feed without the former category hub', () => {
    const { container } = renderPage();

    expect(hooks.useNotificationsQuery).toHaveBeenCalledWith({ params: { limit: 20, platform: 'web' } });
    expect(container.textContent).toContain('鲸浪记账');
    expect(container.textContent).toContain('4分钟前');
    expect(container.textContent).toContain('分账本“报销账本”有一个新的加入申请');
    expect(container.querySelector('[data-testid="message-notification-action-notification-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="message-notification-action-notification-2"]')).not.toBeNull();
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

  it('marks a general unread notification as read when clicked', async () => {
    hooks.markRead.mockResolvedValue({ data: {} });
    renderedNotifications = [{
      ...passiveNotification,
      id: 'notification-unread-general',
      status: UserNotificationStatus.UNREAD,
    }];
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>(
        '[data-testid="message-notification-action-notification-unread-general"]',
      )?.click();
      await Promise.resolve();
    });

    expect(hooks.markRead).toHaveBeenCalledWith({ id: 'notification-unread-general', version: 1 });
  });

  it('loads the next page automatically when the bottom sentinel becomes visible', async () => {
    let resolveFetch: (() => void) | undefined;
    hooks.fetchNextPage.mockReturnValue(new Promise<void>((resolve) => {
      resolveFetch = resolve;
    }));
    const { container } = renderPage();

    await act(async () => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      await Promise.resolve();
    });
    expect(hooks.fetchNextPage).toHaveBeenCalledOnce();
    await act(async () => resolveFetch?.());
    expect(container.querySelector('[data-testid="message-load-more"]')).toBeNull();
    expect(container.querySelector('[data-testid="message-read-all"]')).toBeNull();
  });

  it('only toggles selection for an actionable notification in edit mode', async () => {
    const { container, router } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-edit"]')?.click();
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-select-notification-1"]')?.click();
    });

    expect(hooks.markRead).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe('/message');
    expect(container.querySelector('[data-testid="message-select-notification-1"]')?.getAttribute('aria-pressed'))
      .toBe('true');
  });

  it('does not select notifications loaded after selecting all current items', async () => {
    const laterNotification = { ...passiveNotification, id: 'notification-3', title: '后加载通知' };
    const { container, rerender } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-edit"]')?.click();
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-select-all"]')?.click();
    });
    renderedNotifications = [...renderedNotifications, laterNotification];
    rerender();

    expect(container.querySelector('[data-testid="message-select-notification-3"]')?.getAttribute('aria-pressed'))
      .toBe('false');
  });

  it('selects loaded notifications in edit mode and soft-archives the selected versions after confirmation', async () => {
    hooks.archive.mockResolvedValue({ failedIds: [], succeededIds: ['notification-1', 'notification-2'] });
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-edit"]')?.click();
    });
    expect(container.querySelector('[data-testid="message-select-notification-1"]')).not.toBeNull();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-select-all"]')?.click();
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-delete-selected"]')?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(dialogConfirm).toHaveBeenCalledOnce();
    expect(hooks.archive).toHaveBeenCalledWith([
      { id: 'notification-1', version: 2 },
      { id: 'notification-2', version: 1 },
    ]);
  });

  it('does not archive selected notifications when the confirmation is cancelled', async () => {
    dialogConfirm.mockResolvedValue(false);
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-edit"]')?.click();
      container.querySelector<HTMLButtonElement>('[data-testid="message-select-notification-1"]')?.click();
      container.querySelector<HTMLButtonElement>('[data-testid="message-delete-selected"]')?.click();
      await Promise.resolve();
    });

    expect(hooks.archive).not.toHaveBeenCalled();
  });

  it('refreshes the list, exits edit mode, and reports when only some archives fail', async () => {
    hooks.archive.mockResolvedValue({ failedIds: ['notification-2'], succeededIds: ['notification-1'] });
    hooks.refetch.mockImplementation(async () => {
      renderedNotifications = [passiveNotification];
      return {};
    });
    const { container } = renderPage();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-edit"]')?.click();
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-select-all"]')?.click();
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="message-delete-selected"]')?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hooks.refetch).toHaveBeenCalledOnce();
    expect(showAppError).toHaveBeenCalledOnce();
    expect(container.querySelector('[data-testid="message-select-notification-2"]')).toBeNull();
    expect(container.querySelector('[data-testid="message-notification-notification-2"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="message-notification-notification-1"]')).toBeNull();
  });
});
