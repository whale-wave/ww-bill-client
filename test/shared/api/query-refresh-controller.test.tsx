import type { AppState } from '@capacitor/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/shared/api/query-client';
import { QueryRefreshController } from '@/shared/api/query-refresh-controller';

const capacitorApp = vi.hoisted(() => ({
  appStateListener: undefined as ((state: AppState) => void) | undefined,
  removeListener: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((_eventName: string, listener: (state: AppState) => void) => {
      capacitorApp.appStateListener = listener;
      return Promise.resolve({ remove: capacitorApp.removeListener });
    }),
  },
}));

describe('query refresh controller', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    capacitorApp.appStateListener = undefined;
    capacitorApp.removeListener.mockReset();
  });

  it('silently refetches active page queries after the app returns to the foreground', async () => {
    const client = createQueryClient();
    const refetchQueries = vi.spyOn(client, 'refetchQueries').mockResolvedValue();
    const container = document.createElement('div');
    const root = createRoot(container);
    cleanups.push(() => {
      act(() => root.unmount());
      client.clear();
    });

    await act(async () => {
      root.render(createElement(
        QueryClientProvider,
        { client },
        createElement(QueryRefreshController, null, createElement('main')),
      ));
    });
    await vi.waitFor(() => expect(refetchQueries).toHaveBeenCalledTimes(1));

    act(() => capacitorApp.appStateListener?.({ isActive: false }));
    act(() => capacitorApp.appStateListener?.({ isActive: true }));

    expect(refetchQueries).toHaveBeenCalledTimes(2);
    expect(refetchQueries).toHaveBeenLastCalledWith({ type: 'active' });
  });
});
