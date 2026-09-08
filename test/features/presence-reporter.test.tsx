import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth';
import { PresenceReporter } from '@/features/presence';

const capacitorApp = vi.hoisted(() => ({
  appStateListener: undefined as ((state: { isActive: boolean }) => void) | undefined,
  removeListener: vi.fn(),
}));
const presenceApi = vi.hoisted(() => ({ reportPresence: vi.fn().mockResolvedValue(undefined) }));
const authContext = vi.hoisted(() => ({
  identity: { credentialRevision: 3, sessionEpoch: 7 },
  token: 'session-token',
}));
const captureRequestAuth = vi.hoisted(() => vi.fn(() => authContext));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((_eventName: string, listener: (state: { isActive: boolean }) => void) => {
      capacitorApp.appStateListener = listener;
      return Promise.resolve({ remove: capacitorApp.removeListener });
    }),
  },
}));

vi.mock('@/entities/auth/api', () => presenceApi);
vi.mock('@/shared/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  captureRequestAuth,
}));

describe('presence reporter', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    capacitorApp.appStateListener = undefined;
    capacitorApp.removeListener.mockReset();
    presenceApi.reportPresence.mockClear();
    captureRequestAuth.mockClear();
    useAuthStore.setState({ token: '', userId: '' });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    vi.useRealTimers();
  });

  it('reports while authenticated and foregrounded, then stops in the background', async () => {
    vi.useFakeTimers();
    useAuthStore.setState({ token: 'session-token' });
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));
    expect(presenceApi.reportPresence).toHaveBeenNthCalledWith(1, 'online', authContext);

    await act(async () => vi.advanceTimersByTimeAsync(45_000));
    expect(presenceApi.reportPresence).toHaveBeenNthCalledWith(2, 'online', authContext);

    act(() => capacitorApp.appStateListener?.({ isActive: false }));
    expect(presenceApi.reportPresence).toHaveBeenNthCalledWith(3, 'offline', authContext);
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    expect(presenceApi.reportPresence).toHaveBeenCalledTimes(3);

    act(() => capacitorApp.appStateListener?.({ isActive: true }));
    expect(presenceApi.reportPresence).toHaveBeenNthCalledWith(4, 'online', authContext);
  });

  it('does not report without a login token', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));

    expect(presenceApi.reportPresence).not.toHaveBeenCalled();
  });

  it('uses the effect session when logout cleanup reports offline', async () => {
    useAuthStore.setState({ token: 'session-token' });
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));
    useAuthStore.setState({ token: '' });
    await act(async () => root.render(createElement(PresenceReporter)));

    expect(presenceApi.reportPresence).toHaveBeenNthCalledWith(2, 'offline', authContext);
    expect(captureRequestAuth).toHaveBeenCalledTimes(1);
  });
});
