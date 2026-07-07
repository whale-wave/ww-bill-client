import type { FC } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Router } from '@/app/router';
import { queryClient } from '@/shared/api';
import { SeniorModeProvider } from '@/shared/lib/senior-mode';

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SeniorModeProvider>
        <ReactQueryDevtools />
        <Router />
      </SeniorModeProvider>
    </QueryClientProvider>
  );
};
