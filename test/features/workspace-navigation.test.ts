import { describe, expect, it } from 'vitest';
import { LedgerCapability } from '@/entities/ledger';
import {
  getWorkspaceHomePath,
  getWorkspaceScope,
  isWorkspaceHomePath,
  shouldUseWorkspaceHistoryBack,
} from '@/features/workspace-navigation';

describe('workspace navigation', () => {
  it.each([
    ['/detail', { type: 'personal' }],
    ['/search-record?q=lunch', { type: 'personal' }],
    ['/ledgers/ledger%2Fa/records', { ledgerId: 'ledger/a', type: 'custom' }],
    ['/households/household%2Fa/settings', { householdId: 'household/a', type: 'household' }],
  ] as const)('resolves %s to its workspace scope', (pathname, scope) => {
    expect(getWorkspaceScope(pathname)).toEqual(scope);
  });

  it('uses the records home for readable custom ledgers and ledger detail otherwise', () => {
    expect(getWorkspaceHomePath({
      capabilities: [LedgerCapability.RECORD_READ],
      ledgerId: 'ledger/a',
      type: 'custom',
    })).toBe('/ledgers/ledger%2Fa/records');
    expect(getWorkspaceHomePath({
      capabilities: [LedgerCapability.LEDGER_READ],
      ledgerId: 'ledger/a',
      type: 'custom',
    })).toBe('/ledgers/ledger%2Fa');
  });

  it('treats both household home aliases as the same workspace home', () => {
    const scope = { householdId: 'household/a', type: 'household' } as const;
    expect(isWorkspaceHomePath('/households/household%2Fa', scope)).toBe(true);
    expect(isWorkspaceHomePath('/households/household%2Fa/records', scope)).toBe(true);
  });

  it('uses history only when the page was reached inside the app', () => {
    expect(shouldUseWorkspaceHistoryBack({ historyIndex: 2, locationKey: 'route-key' })).toBe(true);
    expect(shouldUseWorkspaceHistoryBack({ historyIndex: 0, locationKey: 'default' })).toBe(false);
    expect(shouldUseWorkspaceHistoryBack({ locationKey: 'route-key' })).toBe(true);
  });
});
