import type { LedgerListItem } from '@/entities/ledger';
import type {
  LedgerTransferConflict,
  LedgerTransferRequest,
} from '@/entities/ledger-data';
import { LedgerCapability } from '@/entities/ledger';

export function buildSourceLedgerOptions(
  ledgers: LedgerListItem[],
  currentLedgerId: string,
) {
  return ledgers.filter(ledger => ledger.id !== currentLedgerId
    && ledger.capabilities.includes(LedgerCapability.DATA_TRANSFER)
    && ledger.capabilities.includes(LedgerCapability.RECORD_READ));
}

export function buildLedgerTransferRequest(
  input: LedgerTransferRequest,
): LedgerTransferRequest {
  return {
    ...input,
    recordIds: [...input.recordIds],
    categoryMappings: { ...input.categoryMappings },
    ...(input.tagStrategy === 'map'
      ? { tagMappings: { ...(input.tagMappings ?? {}) } }
      : {}),
  };
}

export function groupLedgerTransferConflicts(
  conflicts: LedgerTransferConflict[],
) {
  const grouped = new Map<number, LedgerTransferConflict[]>();
  conflicts.forEach((conflict) => {
    grouped.set(conflict.recordId, [
      ...(grouped.get(conflict.recordId) ?? []),
      conflict,
    ]);
  });
  return [...grouped.entries()].map(([recordId, recordConflicts]) => ({
    recordId,
    conflicts: recordConflicts,
  }));
}
