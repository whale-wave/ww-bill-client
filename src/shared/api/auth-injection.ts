/**
 * Auth dependency injection point.
 *
 * `shared/api` needs the auth token and a logout callback for 401/402/403
 * responses, but in FSD `shared/` cannot import from `features/`. The app
 * layer wires the real implementations at startup via `setAuthDeps`.
 *
 * Default no-ops keep `shared/api` usable in isolation (e.g. tests).
 */

interface AuthDeps {
  tokenGetter: () => string;
  logoutHandler: () => void;
}

let tokenGetter: () => string = () => '';
let logoutHandler: () => void = () => {};

export function setAuthDeps(deps: AuthDeps): void {
  tokenGetter = deps.tokenGetter;
  logoutHandler = deps.logoutHandler;
}

export function getAuthToken(): string {
  return tokenGetter();
}

export function handleAuthLogout(): void {
  logoutHandler();
}
