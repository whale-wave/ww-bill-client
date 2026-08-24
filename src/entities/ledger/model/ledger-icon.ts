export const LEDGER_ICON_KEYS = [
  'wallet',
  'briefcase',
  'receipt',
  'building',
  'users',
  'store',
] as const;

export type LedgerIconKey = typeof LEDGER_ICON_KEYS[number];

export const DEFAULT_LEDGER_ICON_KEY: LedgerIconKey = 'wallet';

const ledgerIconKeySet: ReadonlySet<string> = new Set(LEDGER_ICON_KEYS);

export function isLedgerIconKey(
  value: string | null | undefined,
): value is LedgerIconKey {
  return typeof value === 'string' && ledgerIconKeySet.has(value);
}
