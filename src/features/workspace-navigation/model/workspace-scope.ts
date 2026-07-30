import type { LedgerCapability } from '@/entities/ledger';
import { LedgerCapability as Capability } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';

export interface PersonalWorkspaceScope {
  type: 'personal';
}

export interface CustomWorkspaceScope {
  capabilities?: readonly LedgerCapability[];
  ledgerId: string;
  type: 'custom';
}

export interface HouseholdWorkspaceScope {
  householdId: string;
  type: 'household';
}

export type WorkspaceScope
  = | PersonalWorkspaceScope
    | CustomWorkspaceScope
    | HouseholdWorkspaceScope;

const customWorkspacePattern = /^\/ledgers\/([^/]+)(?:\/|$)/;
const householdWorkspacePattern = /^\/households\/([^/]+)(?:\/|$)/;
const staticLedgerSegments = new Set([
  'applications',
  'create',
  'join',
  'management',
  'preferences',
  'templates',
]);

function cleanPathname(pathname: string) {
  return pathname.split(/[?#]/, 1)[0] || '/';
}

function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  }
  catch {
    return value;
  }
}

export function getWorkspaceScope(pathname: string): WorkspaceScope {
  const cleanPath = cleanPathname(pathname);
  const householdMatch = cleanPath.match(householdWorkspacePattern);
  if (householdMatch) {
    return {
      householdId: decodeRouteSegment(householdMatch[1]!),
      type: 'household',
    };
  }

  const customMatch = cleanPath.match(customWorkspacePattern);
  if (customMatch && !staticLedgerSegments.has(customMatch[1]!)) {
    return {
      ledgerId: decodeRouteSegment(customMatch[1]!),
      type: 'custom',
    };
  }

  return { type: 'personal' };
}

export function getWorkspaceHomePath(scope: WorkspaceScope) {
  if (scope.type === 'personal')
    return ROUTES_PATH.DETAIL.getPath();
  if (scope.type === 'household')
    return ROUTES_PATH.HOUSEHOLD_HOME.getPath(scope.householdId);
  if (scope.capabilities?.includes(Capability.RECORD_READ) === false)
    return ROUTES_PATH.LEDGER_DETAIL.getPath(scope.ledgerId);
  return ROUTES_PATH.LEDGER_RECORDS.getPath(scope.ledgerId);
}

export function isWorkspaceHomePath(pathname: string, scope: WorkspaceScope) {
  const cleanPath = cleanPathname(pathname);
  if (scope.type === 'household') {
    return cleanPath === ROUTES_PATH.HOUSEHOLD_HOME.getPath(scope.householdId)
      || cleanPath === ROUTES_PATH.HOUSEHOLD_RECORDS.getPath(scope.householdId);
  }
  return cleanPath === getWorkspaceHomePath(scope);
}
