import type { LedgerListItem } from '@/entities/ledger';
import { describe, expect, it } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import {
  getLedgerSurface,
  getLedgerWorkspacePath,
  getLedgerWorkspaceScope,
  resolveLedgerSwitchTarget,
  toLedgerSwitcherItems,
} from '@/features/ledger-switcher';

function ledger(overrides: Partial<LedgerListItem> = {}): LedgerListItem {
  return {
    activeMemberCount: 1,
    archivedAt: undefined,
    capabilities: [
      LedgerCapability.RECORD_READ,
      LedgerCapability.RECORD_CREATE,
      LedgerCapability.BUDGET_READ,
      LedgerCapability.CHART_READ,
    ],
    createdAt: '2026-07-22T00:00:00.000Z',
    createdByUserId: 7,
    iconKey: 'book',
    id: 'ledger-1',
    kind: LedgerKind.CUSTOM,
    monthStartDay: 1,
    myMembership: { id: 'member-1', sortOrder: 0, version: 2 },
    myRole: LedgerRole.OWNER,
    name: '旅行账本',
    ownerUserId: 7,
    recordCount: 12,
    status: LedgerStatus.ACTIVE,
    themeKey: 'green',
    updatedAt: '2026-07-22T00:00:00.000Z',
    version: 3,
    ...overrides,
  };
}

describe('ledger workspace navigation', () => {
  it.each([
    ['/detail', 'personal', 'records'],
    ['/bookkeeping', 'personal', 'create'],
    ['/bill', 'personal', 'bill'],
    ['/budget', 'personal', 'budget'],
    ['/chart', 'personal', 'charts'],
    ['/ledgers/ledger%2Fa%20b/records', 'custom', 'records'],
    ['/ledgers/ledger%2Fa%20b/records/new', 'custom', 'create'],
    ['/ledgers/ledger%2Fa%20b/bill', 'custom', 'bill'],
    ['/ledgers/ledger%2Fa%20b/budget', 'custom', 'budget'],
    ['/ledgers/ledger%2Fa%20b/charts', 'custom', 'charts'],
  ])('maps %s to its workspace and surface', (pathname, scopeType, surface) => {
    const scope = getLedgerWorkspaceScope(pathname);

    expect(scope.type).toBe(scopeType);
    if (scope.type === 'custom')
      expect(scope.ledgerId).toBe('ledger/a b');
    expect(getLedgerSurface(pathname)).toBe(surface);
  });

  it.each([
    ['records', '/detail', '/ledgers/ledger%2Fa%20b/records'],
    ['create', '/bookkeeping', '/ledgers/ledger%2Fa%20b/records/new'],
    ['bill', '/bill', '/ledgers/ledger%2Fa%20b/bill'],
    ['budget', '/budget', '/ledgers/ledger%2Fa%20b/budget'],
    ['charts', '/chart', '/ledgers/ledger%2Fa%20b/charts'],
  ] as const)('builds personal and encoded custom %s paths', (surface, personal, custom) => {
    expect(getLedgerWorkspacePath({ type: 'personal' }, surface)).toBe(personal);
    expect(getLedgerWorkspacePath({ ledgerId: 'ledger/a b', type: 'custom' }, surface))
      .toBe(custom);
  });

  it('falls unknown paths back to the records surface', () => {
    expect(getLedgerSurface('/ledgers/ledger-1/settings')).toBe('records');
    expect(getLedgerSurface('/something-unknown')).toBe('records');
  });

  it('converts system default to an ID-free default-ledger item and keeps it first', () => {
    const items = toLedgerSwitcherItems([
      ledger({ id: 'custom-2', myMembership: { id: 'm-2', sortOrder: 2, version: 1 } }),
      ledger({
        id: 'private-default-id',
        kind: LedgerKind.SYSTEM_DEFAULT,
        name: '系统默认账本',
        recordCount: 8,
      }),
      ledger({ id: 'custom-1', myMembership: { id: 'm-1', sortOrder: 1, version: 1 } }),
    ]);

    expect(items[0]).toEqual({
      iconKey: 'book',
      kind: LedgerKind.SYSTEM_DEFAULT,
      recordCount: 8,
      templateKey: undefined,
      type: 'personal',
    });
    expect(items[0]).not.toHaveProperty('ledgerId');
    expect(items[0]).not.toHaveProperty('ledger');
    expect(items.slice(1).map(item => item.type === 'custom' && item.ledgerId))
      .toEqual(['custom-2', 'custom-1']);
  });

  it('preserves the canonical API order when custom ledgers have equal sort orders', () => {
    const items = toLedgerSwitcherItems([
      ledger({
        id: 'custom-b',
        myMembership: { id: 'm-b', sortOrder: 1, version: 1 },
      }),
      ledger({
        id: 'custom-a',
        myMembership: { id: 'm-a', sortOrder: 1, version: 1 },
      }),
    ]);

    expect(items.filter(item => item.type === 'custom').map(item => item.ledgerId))
      .toEqual(['custom-b', 'custom-a']);
  });

  it.each([
    ['records', LedgerCapability.RECORD_READ, '/ledgers/ledger%2Fa%20b/records'],
    ['create', LedgerCapability.RECORD_CREATE, '/ledgers/ledger%2Fa%20b/records/new'],
    ['bill', LedgerCapability.RECORD_READ, '/ledgers/ledger%2Fa%20b/bill'],
    ['budget', LedgerCapability.BUDGET_READ, '/ledgers/ledger%2Fa%20b/budget'],
    ['charts', LedgerCapability.CHART_READ, '/ledgers/ledger%2Fa%20b/charts'],
  ] as const)('requires the matching capability for %s', (surface, capability, expected) => {
    const item = toLedgerSwitcherItems([
      ledger({
        capabilities: [capability],
        id: 'ledger/a b',
        kind: LedgerKind.CUSTOM,
      }),
    ]).find(candidate => candidate.type === 'custom');

    expect(resolveLedgerSwitchTarget(item!, surface)).toBe(expected);
  });

  it('falls back to readable records and then ledger detail', () => {
    const readable = toLedgerSwitcherItems([
      ledger({ capabilities: [LedgerCapability.RECORD_READ], id: 'ledger/a b' }),
    ]).find(item => item.type === 'custom')!;
    const unreadable = toLedgerSwitcherItems([
      ledger({ capabilities: [], id: 'ledger/a b' }),
    ]).find(item => item.type === 'custom')!;

    expect(resolveLedgerSwitchTarget(readable, 'charts'))
      .toBe('/ledgers/ledger%2Fa%20b/records');
    expect(resolveLedgerSwitchTarget(unreadable, 'charts'))
      .toBe('/ledgers/ledger%2Fa%20b');
  });

  it('always resolves the personal circle target to personal detail', () => {
    const personal = toLedgerSwitcherItems([])[0]!;

    expect(resolveLedgerSwitchTarget(personal, 'records')).toBe('/detail');
  });
});
