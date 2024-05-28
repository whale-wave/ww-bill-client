import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import './index.scss';
import './components/reset.scss';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient();

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
