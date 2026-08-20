import type { LedgerListItem } from '@/entities/ledger';
import { describe, expect, it } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import { buildSourceLedgerOptions } from '@/pages/ledger-transfer/model';

function ledger(
  id: string,
  capabilities: LedgerCapability[],
): LedgerListItem {
  return {
    activeMemberCount: 1,
    capabilities,
    createdAt: '2026-08-01T00:00:00.000Z',
    createdByUserId: 1,
    iconKey: 'wallet',
    id,
    kind: LedgerKind.CUSTOM,
    monthStartDay: 1,
    myMembership: { id: `membership-${id}`, sortOrder: 0, version: 1 },
    myRole: LedgerRole.OWNER,
    name: id,
    ownerUserId: 1,
    recordCount: 1,
    status: LedgerStatus.ACTIVE,
    themeKey: 'ocean',
    updatedAt: '2026-08-01T00:00:00.000Z',
    version: 1,
  };
}

describe('ledger transfer source options', () => {
  it('keeps readable transfer sources and excludes the current target ledger', () => {
    const eligible = ledger('eligible', [
      LedgerCapability.DATA_TRANSFER,
      LedgerCapability.RECORD_READ,
    ]);

    expect(buildSourceLedgerOptions([
      ledger('target', [LedgerCapability.DATA_TRANSFER, LedgerCapability.RECORD_READ]),
      eligible,
      ledger('read-only', [LedgerCapability.RECORD_READ]),
      ledger('transfer-only', [LedgerCapability.DATA_TRANSFER]),
    ], 'target')).toEqual([eligible]);
  });
});
