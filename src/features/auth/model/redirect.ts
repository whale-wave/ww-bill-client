import type { Location } from 'react-router-dom';

export interface AuthRedirectState {
  from: Location;
  kind: 'auth-required';
}

export function isAuthRequiredRedirectState(value: unknown): value is AuthRedirectState {
  if (!value || typeof value !== 'object')
    return false;
  return (value as { kind?: unknown }).kind === 'auth-required';
}
