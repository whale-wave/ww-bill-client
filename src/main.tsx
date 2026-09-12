import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initResetStyle } from '@/assets/styles/reset';
import { clearHouseholdInvitationCache } from '@/entities/household';
import { clearLedgerInvitationCache } from '@/entities/ledger';
import { applyAppearancePreference, readAppearancePreferenceMirror, resetAppearancePreference } from '@/features/appearance';
import { rehydrateAuthStore, useAuthStore } from '@/features/auth';
import { setAuthDeps } from '@/shared/api/auth-injection';
import { APP_INFO } from '@/shared/config/app-info';
import { refreshBeforeAppStart } from '@/shared/config/build-info';
import { clearMonitoringUser, ErrorBoundary, SentryErrorFallback, setMonitoringUser } from '@/shared/monitoring';
import '@/shared/monitoring/sentry';
import '@/shared/i18n';
import '@/assets/styles/index.scss';

initResetStyle();
const designStudioHash = window.location.hash;
const isDesignStudio = import.meta.env.DEV
  && (designStudioHash === '#/design-system' || designStudioHash.startsWith('#/design-system/preview'));

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
else {
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
    const authState = useAuthStore.getState();
    if (authState.token && authState.userId)
      applyAppearancePreference(readAppearancePreferenceMirror(authState.userId));
    else
      resetAppearancePreference();
    if (authState.userId)
      setMonitoringUser(authState.userId);
    else
      clearMonitoringUser();
    useAuthStore.subscribe((state, previousState) => {
      if (state.userId !== previousState.userId)
        state.userId ? setMonitoringUser(state.userId) : clearMonitoringUser();
    });
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
    root.render(
      <React.StrictMode>
        <ErrorBoundary fallback={<SentryErrorFallback />}>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  })();
}
