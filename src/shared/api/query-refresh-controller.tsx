import type { FC, PropsWithChildren } from 'react';
import type { AccountQueryPersister } from './query-persister';
import { App } from '@capacitor/app';
import { useIsRestoring, useQueryClient } from '@tanstack/react-query';
import { persistQueryClientSave } from '@tanstack/react-query-persist-client';
import { useEffect, useRef } from 'react';
import { dehydrateOptions, QUERY_PERSIST_BUSTER } from './query-client';

interface QueryRefreshControllerProps extends PropsWithChildren {
  persister?: AccountQueryPersister;
}

export const QueryRefreshController: FC<QueryRefreshControllerProps> = ({ children, persister }) => {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const didInitialRefreshRef = useRef(false);
  const wasActiveRef = useRef(true);

  useEffect(() => {
    if (isRestoring || didInitialRefreshRef.current)
      return;
    didInitialRefreshRef.current = true;
    if (persister) {
      void (async () => {
        await persistQueryClientSave({
          queryClient,
          persister,
          buster: QUERY_PERSIST_BUSTER,
          dehydrateOptions,
        });
        await persister.flush();
      })();
    }
    void queryClient.refetchQueries({ type: 'active' });
  }, [isRestoring, persister, queryClient]);

  useEffect(() => {
    const refreshActiveQueries = () => {
      void queryClient.refetchQueries({ type: 'active' });
    };
    const flush = () => {
      void persister?.flush();
    };
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (!isActive) {
        flush();
        wasActiveRef.current = false;
        return;
      }
      if (!wasActiveRef.current)
        refreshActiveQueries();
      wasActiveRef.current = true;
    };
    const handleVisibilityChange = () => {
      handleAppStateChange({ isActive: document.visibilityState === 'visible' });
    };

    const appListener = App.addListener('appStateChange', handleAppStateChange);
    window.addEventListener('online', refreshActiveQueries);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      void appListener.then(listener => listener.remove());
      window.removeEventListener('online', refreshActiveQueries);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persister, queryClient]);

  return <>{children}</>;
};
