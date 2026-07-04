import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initResetStyle } from '@/assets/styles/reset';
import { useUserStore } from '@/features/auth';
import { setAuthDeps } from '@/shared/api';
import { Router } from './router';
import './i18n';
import '@/assets/styles/index.scss';

initResetStyle();

export const queryClient = new QueryClient();

// Wire auth token/logout into shared/api (FSD: shared cannot import features)
setAuthDeps({
  tokenGetter: () => useUserStore.getState().token,
  logoutHandler: () => useUserStore.getState().logOut(),
});

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <Router />
    </QueryClientProvider>
  </React.StrictMode>,
);
