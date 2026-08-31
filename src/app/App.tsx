import type { FC } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Router } from '@/app/router';
import { AndroidUpdateController } from '@/features/app-update';
import { useAuthStore } from '@/features/auth';
import { CACHE_MAX_AGE, dehydrateOptions, QUERY_PERSIST_BUSTER } from '@/shared/api/query-client';
import { QueryRefreshController } from '@/shared/api/query-refresh-controller';
import { isDevToolEnabled } from '@/shared/config/dev-tools';
import { SeniorModeProvider } from '@/shared/lib/senior-mode';

const isQueryDevtoolsEnabled = isDevToolEnabled({
  enabledFlag: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS,
  isDev: import.meta.env.DEV,
});

export const App: FC = () => {
  const runtime = useAuthStore(state => state.runtime);
  const { queryClient, persister } = runtime;
  const providerKey = `${runtime.sessionEpoch}:${runtime.persistenceBindingRevision}`;

  if (!persister) {
    return (
      <QueryClientProvider key={providerKey} client={queryClient}>
        <QueryRefreshController>
          <AndroidUpdateController />
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
      key={providerKey}
      client={queryClient}
      persistOptions={{
        buster: QUERY_PERSIST_BUSTER,
        maxAge: CACHE_MAX_AGE,
        persister,
        dehydrateOptions,
      }}
    >
      <QueryRefreshController persister={persister}>
        <AndroidUpdateController />
        <SeniorModeProvider>
          {isQueryDevtoolsEnabled && <ReactQueryDevtools />}
          <Router />
        </SeniorModeProvider>
      </QueryRefreshController>
    </PersistQueryClientProvider>
  );
};
