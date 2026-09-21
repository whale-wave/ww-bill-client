import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { ClientUpdateController } from '@/features/app-update';

const hooks = vi.hoisted(() => ({
  appStateChange: null as null | ((state: { isActive: boolean }) => void),
  fetchBuildInfo: vi.fn(),
  getPlatformLatestReleaseApi: vi.fn(),
  invalidateQueries: vi.fn(),
  markRead: vi.fn(),
  notifications: [] as any[],
  platform: 'web' as 'web' | 'android',
  refetchAndroid: vi.fn(),
  refreshForBuild: vi.fn(),
  socketHandlers: {} as Record<string, (data?: { id?: number; kind?: string }) => void>,
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn().mockImplementation((_event, callback) => {
      hooks.appStateChange = callback;
      return Promise.resolve({ remove: vi.fn() });
    }),
    getInfo: vi.fn().mockResolvedValue({ build: '9', version: '1.0.9' }),
  },
}));
vi.mock('@capacitor/core', async importOriginal => ({
  ...await importOriginal<typeof import('@capacitor/core')>(),
  Capacitor: { getPlatform: () => hooks.platform },
}));
vi.mock('@tanstack/react-query', async importOriginal => ({
  ...await importOriginal<typeof import('@tanstack/react-query')>(),
  useQueryClient: () => ({ invalidateQueries: hooks.invalidateQueries }),
}));
vi.mock('@/entities/app-release', () => ({
  getPlatformLatestReleaseApi: hooks.getPlatformLatestReleaseApi,
  useClientLatestReleaseQuery: () => ({ refetch: hooks.refetchAndroid }),
}));
vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    markNotificationReadApi: hooks.markRead,
    NotificationDetailModal: ({ notification, onClose }: any) => notification
      ? createElement('button', { 'data-testid': 'notification-detail-modal', 'onClick': onClose }, notification.title)
      : null,
    useNotificationsQuery: () => ({ data: hooks.notifications }),
  };
});
vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: { token: string }) => unknown) => selector({ token: 'token' }),
}));
vi.mock('@/shared/api/socket', () => ({
  getAppSocket: () => ({
    off: (event: string) => { delete hooks.socketHandlers[event]; },
    on: (event: string, callback: (data?: { id?: number; kind?: string }) => void) => { hooks.socketHandlers[event] = callback; },
  }),
}));
vi.mock('@/shared/config/build-info', async importOriginal => ({
  ...await importOriginal<typeof import('@/shared/config/build-info')>(),
  fetchBuildInfo: hooks.fetchBuildInfo,
  refreshForBuild: hooks.refreshForBuild,
}));
vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/lib/time', () => ({ showDate: () => '刚刚' }));
vi.mock('@/features/app-update/ui/VersionUpdateModal', () => ({
  VersionUpdateModal: ({ update, onClose, onConfirm }: any) => update
    ? createElement('div', { 'data-testid': 'version-update-modal' }, createElement('span', null, update.versionName), update.content && createElement('span', null, update.content), createElement('button', { onClick: onClose }, '稍后'), createElement('button', { onClick: onConfirm }, '立即更新'))
    : null,
}));

let cleanup: (() => void) | undefined;
let rerender: (() => Promise<void>) | undefined;

async function renderController() {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(ClientUpdateController));
    await Promise.resolve();
  });
  cleanup = () => act(() => root.unmount());
  rerender = async () => act(async () => {
    root.render(createElement(ClientUpdateController));
    await Promise.resolve();
  });
  return container;
}

beforeEach(() => {
  hooks.platform = 'web';
  hooks.notifications = [];
  hooks.appStateChange = null;
  hooks.socketHandlers = {};
  for (const mock of [hooks.fetchBuildInfo, hooks.getPlatformLatestReleaseApi, hooks.invalidateQueries, hooks.markRead, hooks.refetchAndroid, hooks.refreshForBuild])
    mock.mockReset();
  hooks.fetchBuildInfo.mockResolvedValue({ buildId: 'sha-next', version: '1.0.12' });
  hooks.getPlatformLatestReleaseApi.mockResolvedValue({ data: { versionName: '1.0.11', summary: '旧说明', releaseNotes: '旧内容', images: [] } });
  hooks.refetchAndroid.mockResolvedValue({ data: { data: undefined } });
  hooks.markRead.mockResolvedValue({});
  hooks.invalidateQueries.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  rerender = undefined;
});

describe('independent update and operation prompts', () => {
  it('shows a Web build update before an important operation notice without marking it read', async () => {
    hooks.notifications = [{
      content: '维护动态',
      createdAt: '2026-09-14T00:00:00.000Z',
      id: 'system:1',
      payload: { promptEnabled: false, promptLevel: 'important' },
      status: UserNotificationStatus.UNREAD,
      title: '运营通知',
      type: UserNotificationType.SYSTEM_ANNOUNCEMENT,
      updatedAt: '2026-09-14T00:00:00.000Z',
      version: 1,
    }];
    const container = await renderController();
    expect(container.querySelector('[data-testid="version-update-modal"]')?.textContent).toContain('1.0.12');
    expect(container.querySelector('[data-testid="version-update-modal"]')?.textContent).not.toContain('旧内容');
    expect(container.querySelector('[data-testid="notification-detail-modal"]')).toBeNull();
    expect(hooks.markRead).not.toHaveBeenCalled();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="version-update-modal"] button')?.click();
    });
    expect(container.querySelector('[data-testid="notification-detail-modal"]')?.textContent).toBe('运营通知');
    expect(hooks.markRead).not.toHaveBeenCalled();
  });

  it('updates Web only when the update action is chosen', async () => {
    hooks.getPlatformLatestReleaseApi.mockResolvedValue({ data: { versionName: '1.0.12', summary: '新版', releaseNotes: '新内容', images: [] } });
    const container = await renderController();
    expect(container.querySelector('[data-testid="version-update-modal"]')?.textContent).toContain('新内容');
    expect(hooks.refreshForBuild).not.toHaveBeenCalled();
    await act(async () => {
      container.querySelectorAll<HTMLButtonElement>('[data-testid="version-update-modal"] button')[1]?.click();
    });
    expect(hooks.refreshForBuild).toHaveBeenCalledWith(window.location, 'sha-next');
  });

  it('shows a new Web build while release notes are still loading and keeps dismissal closed', async () => {
    let resolveRelease: ((value: unknown) => void) | undefined;
    hooks.getPlatformLatestReleaseApi.mockReturnValue(new Promise((resolve) => {
      resolveRelease = resolve;
    }));
    const container = await renderController();
    expect(container.querySelector('[data-testid="version-update-modal"]')?.textContent).toContain('1.0.12');
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="version-update-modal"] button')?.click();
    });
    await act(async () => {
      resolveRelease?.({ data: { versionName: '1.0.12', summary: '新版', releaseNotes: '新内容', images: [] } });
    });
    expect(container.querySelector('[data-testid="version-update-modal"]')).toBeNull();
  });

  it('shows an ordinary notice only on a live publish event', async () => {
    hooks.fetchBuildInfo.mockResolvedValue({ buildId: 'local', version: '1.0.11' });
    const notice = {
      content: '新动态',
      createdAt: '2026-09-14T00:00:00.000Z',
      id: 'system:2',
      payload: { promptEnabled: false, promptLevel: 'normal' },
      status: UserNotificationStatus.UNREAD,
      title: '普通通知',
      type: UserNotificationType.SYSTEM_ANNOUNCEMENT,
      updatedAt: '2026-09-14T00:00:00.000Z',
      version: 1,
    };
    hooks.notifications = [notice];
    const container = await renderController();
    expect(container.querySelector('[data-testid="notification-detail-modal"]')).toBeNull();

    hooks.socketHandlers['notification:updated']?.({ id: 2, kind: 'general' });
    hooks.notifications = [notice];
    await rerender?.();
    expect(container.querySelector('[data-testid="notification-detail-modal"]')).toBeNull();

    hooks.socketHandlers['notification:published']?.({ id: 2, kind: 'general' });
    hooks.notifications = [notice];
    await rerender?.();
    expect(container.querySelector('[data-testid="notification-detail-modal"]')?.textContent).toBe('普通通知');
  });

  it('checks Android on every activation and keeps it separate from notification read state', async () => {
    hooks.platform = 'android';
    hooks.refetchAndroid.mockResolvedValue({ data: { data: {
      android: { downloadUrl: 'https://example.com/bill.apk', enabled: false, versionCode: 11 },
      enabled: false,
      highlights: [],
      images: [],
      publishedAt: null,
      releaseNotes: '安装包更新',
      summary: 'v1.0.11',
      versionName: '1.0.11',
      web: { enabled: false, buildId: '' },
    } } });
    const container = await renderController();
    expect(container.querySelector('[data-testid="version-update-modal"]')).not.toBeNull();
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="version-update-modal"] button')?.click();
    });
    expect(container.querySelector('[data-testid="version-update-modal"]')).toBeNull();
    await act(async () => {
      hooks.appStateChange?.({ isActive: true });
      await Promise.resolve();
    });
    expect(container.querySelector('[data-testid="version-update-modal"]')).not.toBeNull();
    expect(hooks.refetchAndroid).toHaveBeenCalledTimes(2);
    expect(hooks.markRead).not.toHaveBeenCalled();
  });
});
