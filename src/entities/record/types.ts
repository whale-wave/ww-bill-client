export interface RecordEntry {
  amount: string;
  category: {
    createdAt: string;
    icon: string;
    id: number;
    name: string;
    updatedAt: string;
  };
  createdAt: string;
  id: number;
  remark: string;
  status?: boolean;
  time: string;
  type: 'sub' | 'add';
  updatedAt: string;
  version: number;
  ledgerId?: string;
  tags?: Array<{
    id: string;
    name: string;
    colorKey?: string;
    iconKey?: string;
    status?: 'ACTIVE' | 'ARCHIVED';
  }>;
}

export interface LedgerRecordDetailLocationState {
  ledgerRecord: RecordEntry;
}

function isRecordEntry(value: unknown): value is RecordEntry {
  if (typeof value !== 'object' || value === null)
    return false;
  return 'amount' in value
    && typeof value.amount === 'string'
    && 'category' in value
    && typeof value.category === 'object'
    && value.category !== null
    && 'id' in value
    && typeof value.id === 'number'
    && Number.isInteger(value.id)
    && 'time' in value
    && typeof value.time === 'string'
    && 'type' in value
    && (value.type === 'add' || value.type === 'sub')
    && 'version' in value
    && typeof value.version === 'number';
}

export function createLedgerRecordDetailState(
  record: RecordEntry,
  ledgerId: string,
): LedgerRecordDetailLocationState {
  return { ledgerRecord: { ...record, ledgerId } };
}

export function readLedgerRecordDetailState(
  value: unknown,
  ledgerId: string,
  recordId: string,
) {
  if (typeof value !== 'object' || value === null || !('ledgerRecord' in value))
    return;
  const record = value.ledgerRecord;
  if (!isRecordEntry(record)
    || record.ledgerId !== ledgerId
    || String(record.id) !== recordId) {
    return;
  }
  return record;
}

/** @deprecated Use RecordEntry. Kept temporarily for existing page state types. */
export type recordChildren = RecordEntry;
