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

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((_eventName: string, listener: (state: { isActive: boolean }) => void) => {
      capacitorApp.appStateListener = listener;
      return Promise.resolve({ remove: capacitorApp.removeListener });
    }),
  },
}));

vi.mock('@/entities/auth/api', () => presenceApi);

describe('presence reporter', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    capacitorApp.appStateListener = undefined;
    capacitorApp.removeListener.mockReset();
    presenceApi.reportPresence.mockClear();
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
    expect(presenceApi.reportPresence).toHaveBeenCalledTimes(1);

    await act(async () => vi.advanceTimersByTimeAsync(45_000));
    expect(presenceApi.reportPresence).toHaveBeenCalledTimes(2);

    act(() => capacitorApp.appStateListener?.({ isActive: false }));
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    expect(presenceApi.reportPresence).toHaveBeenCalledTimes(2);

    act(() => capacitorApp.appStateListener?.({ isActive: true }));
    expect(presenceApi.reportPresence).toHaveBeenCalledTimes(3);
  });

  it('does not report without a login token', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));

    expect(presenceApi.reportPresence).not.toHaveBeenCalled();
  });
});
