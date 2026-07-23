import type { LedgerSwitcherItem } from './ledger-switcher-view-model';
import type { LedgerCapability } from '@/entities/ledger';
import { LedgerCapability as Capability } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';

export type LedgerWorkspaceScope
  = | { type: 'personal' }
    | { type: 'custom'; ledgerId: string };

export type LedgerSurface = 'records' | 'create' | 'bill' | 'budget' | 'charts';

const customLedgerPathPattern = /^\/ledgers\/([^/]+)(?:\/|$)/;
const staticLedgerRouteSegments = new Set([
  'applications',
  'create',
  'join',
  'preferences',
  'templates',
]);

function getCleanPathname(pathname: string) {
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

export function getLedgerWorkspaceScope(pathname: string): LedgerWorkspaceScope {
  const match = getCleanPathname(pathname).match(customLedgerPathPattern);
  if (!match || staticLedgerRouteSegments.has(match[1]!))
    return { type: 'personal' };

  return {
    ledgerId: decodeRouteSegment(match[1]!),
    type: 'custom',
  };
}

export function getLedgerSurface(pathname: string): LedgerSurface {
  const cleanPathname = getCleanPathname(pathname);

  if (/^\/bookkeeping(?:\/|$)/.test(cleanPathname) || /^\/ledgers\/[^/]+\/records\/new(?:\/|$)/.test(cleanPathname))
    return 'create';
  if (/^\/bill(?:\/|$)/.test(cleanPathname) || /^\/ledgers\/[^/]+\/bill(?:\/|$)/.test(cleanPathname))
    return 'bill';
  if (/^\/budget(?:\/|$)/.test(cleanPathname) || /^\/ledgers\/[^/]+\/budget(?:\/|$)/.test(cleanPathname))
    return 'budget';
  if (/^\/chart(?:\/|$)/.test(cleanPathname) || /^\/ledgers\/[^/]+\/charts(?:\/|$)/.test(cleanPathname))
    return 'charts';

  return 'records';
}

export function getLedgerWorkspacePath(
  scope: LedgerWorkspaceScope,
  surface: LedgerSurface,
) {
  if (scope.type === 'personal') {
    const personalPaths: Record<LedgerSurface, string> = {
      bill: ROUTES_PATH.BILL.getPath(),
      budget: ROUTES_PATH.BUDGET.getPath(),
      charts: ROUTES_PATH.CHART.getPath(),
      create: ROUTES_PATH.BOOKKEEPING.getPath(),
      records: ROUTES_PATH.DETAIL.getPath(),
    };
    return personalPaths[surface];
  }

  const customPaths: Record<LedgerSurface, string> = {
    bill: ROUTES_PATH.LEDGER_BILL.getPath(scope.ledgerId),
    budget: ROUTES_PATH.LEDGER_BUDGET.getPath(scope.ledgerId),
    charts: ROUTES_PATH.LEDGER_CHARTS.getPath(scope.ledgerId),
    create: ROUTES_PATH.LEDGER_RECORD_CREATE.getPath(scope.ledgerId),
    records: ROUTES_PATH.LEDGER_RECORDS.getPath(scope.ledgerId),
  };
  return customPaths[surface];
}

const surfaceCapabilities: Record<LedgerSurface, LedgerCapability> = {
  bill: Capability.RECORD_READ,
  budget: Capability.BUDGET_READ,
  charts: Capability.CHART_READ,
  create: Capability.RECORD_CREATE,
  records: Capability.RECORD_READ,
};

export function resolveLedgerSwitchTarget(
  item: LedgerSwitcherItem,
  surface: LedgerSurface,
) {
  if (item.type === 'personal')
    return getLedgerWorkspacePath({ type: 'personal' }, surface);

  const scope: LedgerWorkspaceScope = {
    ledgerId: item.ledgerId,
    type: 'custom',
  };
  if (item.capabilities.includes(surfaceCapabilities[surface]))
    return getLedgerWorkspacePath(scope, surface);
  if (item.capabilities.includes(Capability.RECORD_READ))
    return getLedgerWorkspacePath(scope, 'records');
  return ROUTES_PATH.LEDGER_DETAIL.getPath(item.ledgerId);
}
