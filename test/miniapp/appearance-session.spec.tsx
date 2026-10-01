import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { AppearanceProvider } from '../../miniapp/src/features/appearance';
import { useAuthStore } from '../../miniapp/src/features/auth/store';
import { useAppearanceStore } from '../../miniapp/src/shared/model/appearance';

const { storage, getConfig } = vi.hoisted(() => ({ storage: new Map<string, string>(), getConfig: vi.fn() }));
vi.mock('@tarojs/taro', () => ({ default: {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: string) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
} }));
vi.mock('../../miniapp/src/features/auth', async () => ({ useAuthStore: (await import('../../miniapp/src/features/auth/store')).useAuthStore }));
vi.mock('../../miniapp/src/shared/api', () => ({ api: { get: getConfig } }));

let cleanup: (() => void) | undefined;
let client: QueryClient;

beforeEach(() => {
  storage.clear();
  getConfig.mockReset();
  useAuthStore.getState().logOut();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup?.();
  client.clear();
});

function renderProvider() {
  const root = createRoot(document.createElement('div'));
  act(() => root.render(createElement(QueryClientProvider, { client }, createElement(AppearanceProvider))));
  cleanup = () => act(() => root.unmount());
}

it('reads the account mirror and reconciles the server appearance without editing preferences', async () => {
  storage.set('ww-bill-miniapp-appearance:42', 'minimal');
  getConfig.mockResolvedValue({ userId: 42, appearanceTemplate: 'fresh' });
  useAuthStore.getState().startSession('test-token', '42');
  renderProvider();
  expect(useAppearanceStore.getState().template).toBe('minimal');
  await vi.waitFor(() => expect(useAppearanceStore.getState().template).toBe('fresh'));
  expect(storage.get('ww-bill-miniapp-appearance:42')).toBe('fresh');
  expect(getConfig.mock.calls[0][0]).toBe('/user-app-config');
  act(() => useAuthStore.getState().logOut());
  expect(useAppearanceStore.getState().template).toBe('glass');
});

it('does not apply a delayed response from the previous account', async () => {
  let finishPrevious: (value: unknown) => void = () => undefined;
  getConfig.mockImplementationOnce(() => new Promise((resolve) => {
    finishPrevious = resolve;
  }));
  getConfig.mockResolvedValueOnce({ userId: 43, appearanceTemplate: 'minimal' });
  useAuthStore.getState().startSession('previous-token', '42');
  renderProvider();
  await vi.waitFor(() => expect(getConfig).toHaveBeenCalledTimes(1));
  act(() => useAuthStore.getState().startSession('current-token', '43'));
  await vi.waitFor(() => expect(useAppearanceStore.getState().template).toBe('minimal'));
  await act(async () => {
    finishPrevious({ userId: 42, appearanceTemplate: 'fresh' });
  });
  expect(useAppearanceStore.getState()).toMatchObject({ userId: '43', template: 'minimal' });
  expect(storage.has('ww-bill-miniapp-appearance:42')).toBe(false);
});
