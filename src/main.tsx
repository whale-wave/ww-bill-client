import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import '@/assets/styles/index.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Router } from './router';
import { initResetStyle } from '@/assets/styles/reset';

initResetStyle();

export const queryClient = new QueryClient();

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
