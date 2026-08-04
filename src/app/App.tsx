import type { FC } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Router } from '@/app/router';
import { queryClient } from '@/shared/api';
import { isDevToolEnabled } from '@/shared/config/dev-tools';
import { SeniorModeProvider } from '@/shared/lib/senior-mode';

const isQueryDevtoolsEnabled = isDevToolEnabled({
  enabledFlag: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS,
  isDev: import.meta.env.DEV,
});

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SeniorModeProvider>
        {isQueryDevtoolsEnabled && <ReactQueryDevtools />}
        <Router />
      </SeniorModeProvider>
    </QueryClientProvider>
  );
};
