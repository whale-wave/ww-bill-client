import React from 'react';
import { Inspector } from 'react-dev-inspector';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initResetStyle } from '@/assets/styles/reset';
import { useAuthStore } from '@/features/auth';
import { setAuthDeps } from '@/shared/api';
import '@/shared/i18n';
import '@/assets/styles/index.scss';

initResetStyle();

// Wire auth token/logout into shared/api (FSD: shared cannot import features)
setAuthDeps({
  tokenGetter: () => useAuthStore.getState().token,
  logoutHandler: () => useAuthStore.getState().logOut(),
});

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {import.meta.env.DEV && <Inspector keys={['Alt', 'Shift', 'X']} />}
    <App />
  </React.StrictMode>,
);
