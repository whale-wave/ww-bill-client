import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth';
import { PresenceReporter } from '@/features/presence';

const capacitorApp = vi.hoisted(() => ({
  appStateListener: undefined as ((state: { isActive: boolean }) => void) | undefined,
  removeListener: vi.fn(),
}));
const socketApi = vi.hoisted(() => ({
  disconnectAppSocket: vi.fn(),
  getAppSocket: vi.fn(),
  socket: { connected: false, connect: vi.fn() },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((_eventName: string, listener: (state: { isActive: boolean }) => void) => {
      capacitorApp.appStateListener = listener;
      return Promise.resolve({ remove: capacitorApp.removeListener });
    }),
  },
}));

vi.mock('@/shared/api/socket', () => ({
  disconnectAppSocket: socketApi.disconnectAppSocket,
  getAppSocket: socketApi.getAppSocket,
}));

describe('presence reporter', () => {
  const cleanups: Array<() => void> = [];

  beforeEach(() => {
    socketApi.getAppSocket.mockReturnValue(socketApi.socket);
    socketApi.socket.connected = false;
  });

  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    capacitorApp.appStateListener = undefined;
    capacitorApp.removeListener.mockReset();
    socketApi.disconnectAppSocket.mockReset();
    socketApi.getAppSocket.mockReset();
    socketApi.socket.connect.mockReset();
    useAuthStore.setState({ token: '', userId: '' });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  it('reconnects the authenticated socket when the page returns to the foreground', async () => {
    useAuthStore.setState({ token: 'session-token' });
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));
    expect(socketApi.getAppSocket).toHaveBeenCalledTimes(1);

    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(socketApi.socket.connect).toHaveBeenCalledTimes(1);

    socketApi.socket.connected = true;
    act(() => capacitorApp.appStateListener?.({ isActive: true }));
    expect(socketApi.socket.connect).toHaveBeenCalledTimes(1);

    socketApi.socket.connected = false;
    act(() => capacitorApp.appStateListener?.({ isActive: false }));
    expect(socketApi.socket.connect).toHaveBeenCalledTimes(1);
    act(() => capacitorApp.appStateListener?.({ isActive: true }));
    expect(socketApi.socket.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnects without a login token', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));

    expect(socketApi.getAppSocket).not.toHaveBeenCalled();
    expect(socketApi.disconnectAppSocket).toHaveBeenCalledTimes(1);
  });

  it('removes the foreground listener and disconnects after logout', async () => {
    useAuthStore.setState({ token: 'session-token' });
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => act(() => root.unmount()));

    await act(async () => root.render(createElement(PresenceReporter)));
    await act(async () => useAuthStore.setState({ token: '' }));

    expect(capacitorApp.removeListener).toHaveBeenCalledTimes(1);
    expect(socketApi.disconnectAppSocket).toHaveBeenCalledTimes(1);
  });
});
