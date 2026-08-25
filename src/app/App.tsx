import type { FC } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useMemo } from 'react';
import { Router } from '@/app/router';
import { useAuthStore } from '@/features/auth';
import { createQueryCachePersister, queryClient } from '@/shared/api';
import { QueryRefreshController } from '@/shared/api/query-refresh-controller';
import { isDevToolEnabled } from '@/shared/config/dev-tools';
import { SeniorModeProvider } from '@/shared/lib/senior-mode';

const isQueryDevtoolsEnabled = isDevToolEnabled({
  enabledFlag: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS,
  isDev: import.meta.env.DEV,
});

export const App: FC = () => {
  const userId = useAuthStore(state => state.userId);
  const persister = useMemo(
    () => userId ? createQueryCachePersister(userId) : undefined,
    [userId],
  );

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <QueryRefreshController>
          <SeniorModeProvider>
            {isQueryDevtoolsEnabled && <ReactQueryDevtools />}
            <Router />
          </SeniorModeProvider>
        </QueryRefreshController>
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        buster: 'ww-bill-query-cache-v1',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: query => query.state.status === 'success' && query.meta?.persist !== false,
        },
      }}
    >
      <QueryRefreshController persister={persister}>
        <SeniorModeProvider>
          {isQueryDevtoolsEnabled && <ReactQueryDevtools />}
          <Router />
        </SeniorModeProvider>
      </QueryRefreshController>
    </PersistQueryClientProvider>
  );
};
