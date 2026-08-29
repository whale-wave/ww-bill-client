import type { LedgerRecordType } from '@/entities/ledger';
import type { ShortcutDraft } from '@/entities/shortcut-bookkeeping';
import type { RecordEditorSeed } from '@/features/record-editor';
import dayjs from 'dayjs';

export function createShortcutRecordSeed(
  draft: ShortcutDraft,
  recordType: LedgerRecordType,
): RecordEditorSeed {
  const amount = draft.amountCandidate?.trim();
  const hasValidAmount = Boolean(
    amount
    && /^(?=.*[1-9])(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amount),
  );
  return {
    ...(hasValidAmount
      ? { amount }
      : {}),
    recordType,
    remark: draft.merchantCandidate,
    time: draft.capturedAt && dayjs(draft.capturedAt).isValid()
      ? dayjs(draft.capturedAt).toISOString()
      : dayjs().toISOString(),
  };
}
