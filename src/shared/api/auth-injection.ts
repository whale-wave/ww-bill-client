/**
 * Auth dependency injection point.
 *
 * `shared/api` needs the auth token and a logout callback for 401/402/403
 * responses, but in FSD `shared/` cannot import from `features/`. The app
 * layer wires the real implementations at startup via `setAuthDeps`.
 *
 * Default no-ops keep `shared/api` usable in isolation (e.g. tests).
 */

export interface AuthRequestIdentity {
  sessionEpoch: number;
  credentialRevision: number;
}
export interface AuthRequestAuth { token: string; identity: AuthRequestIdentity }
export interface SessionScope extends AuthRequestIdentity {}
interface AuthDeps {
  captureRequestAuth?: () => AuthRequestAuth;
  captureSessionScope?: () => SessionScope;
  isTransitionCurrent?: (identity: AuthRequestIdentity) => boolean;
  isSessionScopeCurrent?: (scope: SessionScope) => boolean;
  handleAuthFailure?: (identity: AuthRequestIdentity, statusCode: number) => unknown;
  clearSessionScopedCaches?: () => void;
  tokenGetter?: () => string;
  logoutHandler?: () => void;
}

let tokenGetter: () => string = () => '';
let logoutHandler: () => void = () => {};
let captureRequestAuthImpl: () => AuthRequestAuth = () => ({ token: tokenGetter(), identity: { sessionEpoch: 0, credentialRevision: 0 } });
let captureSessionScopeImpl: () => SessionScope = () => captureRequestAuthImpl().identity;
let isTransitionCurrentImpl = () => true;
let isSessionScopeCurrentImpl = () => true;
let handleAuthFailureImpl = (_identity: AuthRequestIdentity, _statusCode: number) => {
  logoutHandler();
  return undefined;
};
let clearSessionScopedCachesImpl = () => {};

export function setAuthDeps(deps: AuthDeps): void {
  tokenGetter = deps.tokenGetter ?? (() => '');
  logoutHandler = deps.logoutHandler ?? (() => {});
  captureRequestAuthImpl = deps.captureRequestAuth ?? (() => ({ token: tokenGetter(), identity: { sessionEpoch: 0, credentialRevision: 0 } }));
  captureSessionScopeImpl = deps.captureSessionScope ?? (() => captureRequestAuthImpl().identity);
  isTransitionCurrentImpl = deps.isTransitionCurrent ?? (() => true);
  isSessionScopeCurrentImpl = deps.isSessionScopeCurrent ?? (() => true);
  handleAuthFailureImpl = deps.handleAuthFailure ?? ((_identity, _statusCode) => {
    logoutHandler();
    return undefined;
  });
  clearSessionScopedCachesImpl = deps.clearSessionScopedCaches ?? (() => {});
}

export function getAuthToken(): string {
  return tokenGetter();
}

export function handleAuthLogout(): void {
  logoutHandler();
}
export function captureRequestAuth() {
  return captureRequestAuthImpl();
}
export function captureSessionScope() {
  return captureSessionScopeImpl();
}
export function isTransitionCurrent(identity: AuthRequestIdentity) {
  return isTransitionCurrentImpl(identity);
}
export function isSessionScopeCurrent(scope: SessionScope) {
  return isSessionScopeCurrentImpl(scope);
}
export function handleAuthFailure(identity: AuthRequestIdentity, statusCode: number) {
  return handleAuthFailureImpl(identity, statusCode);
}
export function clearSessionScopedCaches() {
  clearSessionScopedCachesImpl();
}
