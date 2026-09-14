import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { ClientUpdateController } from '@/features/app-update';

const hooks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  markRead: vi.fn(),
  useNotificationsQuery: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
    getInfo: vi.fn().mockResolvedValue({ build: '9', version: '1.0.9' }),
  },
}));

vi.mock('@capacitor/core', async importOriginal => ({
  ...await importOriginal<typeof import('@capacitor/core')>(),
  Capacitor: { getPlatform: () => 'web' },
}));

vi.mock('@tanstack/react-query', async importOriginal => ({
  ...await importOriginal<typeof import('@tanstack/react-query')>(),
  useQueryClient: () => ({ invalidateQueries: hooks.invalidateQueries }),
}));

vi.mock('@/entities/app-release', () => ({
  appReleaseKeys: { all: ['app-release'] },
}));

vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    markNotificationReadApi: hooks.markRead,
    NotificationDetailModal: ({ notification, typeLabel }: any) => notification
      ? createElement('div', { 'data-testid': 'notification-detail-modal' }, typeLabel)
      : null,
    useNotificationsQuery: hooks.useNotificationsQuery,
  };
});

vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: { token: string }) => unknown) => selector({ token: 'token' }),
}));

vi.mock('@/shared/api/socket', () => ({ getAppSocket: () => null }));
vi.mock('@/shared/i18n', () => ({
  useTranslation: (namespace: string) => ({
    t: (key: string) => namespace === 'common' && key === 'message.notificationCenter.types.CLIENT_RELEASE'
      ? '版本更新'
      : `${namespace}:${key}`,
  }),
}));
vi.mock('@/shared/lib', async importOriginal => ({
  ...await importOriginal<typeof import('@/shared/lib')>(),
  openExternalUrl: vi.fn(),
}));
vi.mock('@/shared/lib/time', () => ({ showDate: () => '刚刚' }));

let cleanup: (() => void) | undefined;

beforeEach(() => {
  hooks.invalidateQueries.mockReset();
  hooks.markRead.mockReset();
  hooks.useNotificationsQuery.mockReturnValue({
    data: [{
      content: '修复了同步体验。',
      createdAt: '2026-09-14T00:00:00.000Z',
      id: 'system:1',
      payload: { promptEnabled: true, versionName: '1.0.10' },
      status: UserNotificationStatus.UNREAD,
      title: '更新版本 v1.0.10',
      type: UserNotificationType.CLIENT_RELEASE,
      updatedAt: '2026-09-14T00:00:00.000Z',
      version: 1,
    }],
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('client update controller', () => {
  it('uses the notification detail modal and the common-language release label', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ClientUpdateController));
      await Promise.resolve();
    });
    cleanup = () => act(() => root.unmount());

    expect(container.querySelectorAll('[data-testid="notification-detail-modal"]')).toHaveLength(1);
    expect(container.textContent).toContain('版本更新');
    expect(container.textContent).not.toContain('CLIENT_RELEASE');
  });

  it('shows only the highest unread, enabled release that is newer than the installed web version', async () => {
    hooks.useNotificationsQuery
      .mockReturnValueOnce({ data: [] })
      .mockReturnValueOnce({
        data: [
          {
            content: '旧版',
            createdAt: '2026-09-14T00:00:00.000Z',
            id: 'system:9',
            payload: { promptEnabled: true, versionName: '1.0.9' },
            status: UserNotificationStatus.UNREAD,
            title: 'v1.0.9',
            type: UserNotificationType.CLIENT_RELEASE,
            updatedAt: '2026-09-14T00:00:00.000Z',
            version: 1,
          },
          {
            content: '最新版',
            createdAt: '2026-09-15T00:00:00.000Z',
            id: 'system:10',
            payload: { promptEnabled: true, versionName: '1.0.10' },
            status: UserNotificationStatus.UNREAD,
            title: 'v1.0.10',
            type: UserNotificationType.CLIENT_RELEASE,
            updatedAt: '2026-09-15T00:00:00.000Z',
            version: 1,
          },
        ],
      });
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ClientUpdateController));
      await Promise.resolve();
    });
    cleanup = () => act(() => root.unmount());

    expect(container.querySelectorAll('[data-testid="notification-detail-modal"]')).toHaveLength(1);
    expect(container.textContent).toContain('版本更新');
  });
});
