import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initResetStyle } from '@/assets/styles/reset';
import { clearHouseholdInvitationCache } from '@/entities/household';
import { clearLedgerInvitationCache } from '@/entities/ledger';
import { rehydrateAuthStore, useAuthStore } from '@/features/auth';
import { setAuthDeps } from '@/shared/api/auth-injection';
import { APP_INFO } from '@/shared/config/app-info';
import { refreshBeforeAppStart } from '@/shared/config/build-info';
import { cleanupImageShareCache } from '@/shared/lib';
import '@/shared/i18n';
import '@/assets/styles/index.scss';

initResetStyle();
void cleanupImageShareCache();

if (import.meta.env.DEV) {
  void import('@locator/runtime').then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  });
}

// Wire auth token/logout into shared/api (FSD: shared cannot import features)
const container = document.getElementById('root')!;
const root = createRoot(container);

void (async () => {
  if (import.meta.env.PROD) {
    try {
      const refreshed = await refreshBeforeAppStart({
        currentBuildId: APP_INFO.buildId,
        location: window.location,
      });
      if (refreshed)
        return;
    }
    catch {
      // Version checks are best-effort. Authentication and bookkeeping must still start offline.
    }
  }
  await rehydrateAuthStore();
  setAuthDeps({
    captureRequestAuth: () => {
      const state = useAuthStore.getState();
      return { token: state.token, identity: { sessionEpoch: state.runtime.sessionEpoch, credentialRevision: state.runtime.credentialRevision } };
    },
    captureSessionScope: () => {
      const state = useAuthStore.getState();
      return { sessionEpoch: state.runtime.sessionEpoch, credentialRevision: state.runtime.credentialRevision };
    },
    isTransitionCurrent: (identity) => {
      const state = useAuthStore.getState();
      return state.runtime.sessionEpoch === identity.sessionEpoch && state.runtime.credentialRevision === identity.credentialRevision;
    },
    isSessionScopeCurrent: (scope) => {
      const state = useAuthStore.getState();
      return state.runtime.sessionEpoch === scope.sessionEpoch;
    },
    handleAuthFailure: (identity) => {
      const state = useAuthStore.getState();
      if (state.runtime.sessionEpoch === identity.sessionEpoch && state.runtime.credentialRevision === identity.credentialRevision)
        return state.logOut();
    },
    logoutHandler: () => { useAuthStore.getState().logOut(); },
    clearSessionScopedCaches: () => {
      clearHouseholdInvitationCache();
      clearLedgerInvitationCache();
    },
  });
  root.render(<React.StrictMode><App /></React.StrictMode>);
})();
