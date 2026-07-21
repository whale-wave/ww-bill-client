import type {
  LedgerTransferConflict,
  LedgerTransferRequest,
} from '@/entities/ledger-data';

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
