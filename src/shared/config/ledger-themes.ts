export const LEDGER_THEME_KEYS = [
  'blue',
  'green',
  'amber',
  'orange',
  'indigo',
  'pink',
] as const;

export type LedgerThemeKey = typeof LEDGER_THEME_KEYS[number];

/** Stable reference palette for user-selectable ledger identities. */
export const LEDGER_THEME_CLASS_NAMES: Record<LedgerThemeKey, string> = {
  amber: 'bg-[#f5b84b]',
  blue: 'bg-[#55b8d2]',
  green: 'bg-[#55b989]',
  indigo: 'bg-[#7f78cf]',
  orange: 'bg-[#ef9061]',
  pink: 'bg-[#df789c]',
};
