import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initResetStyle } from '@/assets/styles/reset';
import { clearHouseholdInvitationCache } from '@/entities/household';
import { clearLedgerInvitationCache } from '@/entities/ledger';
import { applyAppearancePreference, readAppearancePreferenceMirror, resetAppearancePreference } from '@/features/appearance';
import { rehydrateAuthStore, useAuthStore } from '@/features/auth';
import { setAuthDeps } from '@/shared/api/auth-injection';
import '@/shared/i18n';
import '@/assets/styles/index.scss';

initResetStyle();
const isDesignStudio = import.meta.env.DEV
  && (window.location.hash === '#/design-system' || new URLSearchParams(window.location.search).has('design-system-preview'));

if (import.meta.env.DEV && !isDesignStudio) {
  void import('@locator/runtime').then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  });
}

// Wire auth token/logout into shared/api (FSD: shared cannot import features)
const container = document.getElementById('root')!;
const root = createRoot(container);

if (isDesignStudio) {
  void import('@/pages/design-system/DesignSystemPage').then(({ default: DesignSystemPage }) => {
    root.render(<React.StrictMode><DesignSystemPage /></React.StrictMode>);
  });
}

if (!isDesignStudio) {
  void (async () => {
    await rehydrateAuthStore();
    const authState = useAuthStore.getState();
    if (authState.token && authState.userId)
      applyAppearancePreference(readAppearancePreferenceMirror(authState.userId));
    else
      resetAppearancePreference();
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
}
