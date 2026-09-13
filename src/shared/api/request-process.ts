import type { AuthRequestIdentity } from './auth-injection';
import { i18n } from '@/shared/i18n';
import { handleAuthFailure, isTransitionCurrent } from './auth-injection';

function clearTokenToLogin(msg: string, identity?: AuthRequestIdentity, statusCode = 401) {
  if (identity && !isTransitionCurrent(identity))
    return undefined;
  const loggedOut = handleAuthFailure(identity ?? { sessionEpoch: 0, credentialRevision: 0 }, statusCode);
  return loggedOut ? msg : undefined;
}

export function processAuthFailure(statusCode: number | string, identity?: AuthRequestIdentity) {
  if (identity && !isTransitionCurrent(identity))
    return undefined;
  switch (Number.parseInt(`${statusCode}`)) {
    case 403:
      return i18n.t('common:api.forbidden');
    case 402:
      return clearTokenToLogin(i18n.t('common:api.authFailed'), identity, 402);
    case 401:
      return clearTokenToLogin(i18n.t('common:api.notLoggedIn'), identity);
  }
}

// Kept as a compatibility alias for callers that only need auth/session handling.
export const baseResponseProcess = processAuthFailure;
