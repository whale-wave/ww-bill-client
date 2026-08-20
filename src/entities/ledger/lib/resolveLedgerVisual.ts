import type { LedgerIconKey, LedgerTemplateKey } from '../types';
import { isCreatableLedgerTemplateKey, LedgerKind } from '../types';

export type ResolvedLedgerVisual
  = | { type: 'system-logo'; value: 'whale-wave' }
    | { type: 'ledger-icon'; value: LedgerIconKey }
    | { type: 'template-icon'; value: Exclude<LedgerTemplateKey, 'system-default'> }
    | { type: 'fallback'; value: 'ledger' };

const LEDGER_ICON_KEYS: ReadonlySet<string> = new Set<LedgerIconKey>([
  'wallet',
  'briefcase',
  'receipt',
  'building',
  'users',
  'store',
]);

function isLedgerIconKey(value: string | null | undefined): value is LedgerIconKey {
  return typeof value === 'string' && LEDGER_ICON_KEYS.has(value);
}

export function resolveLedgerVisual({
  iconKey,
  kind,
  templateKey,
}: {
  iconKey?: string | null;
  kind?: LedgerKind;
  templateKey?: LedgerTemplateKey | string | null;
}): ResolvedLedgerVisual {
  if (kind === LedgerKind.SYSTEM_DEFAULT)
    return { type: 'system-logo', value: 'whale-wave' };

  if (isLedgerIconKey(iconKey))
    return { type: 'ledger-icon', value: iconKey };

  if (isCreatableLedgerTemplateKey(templateKey))
    return { type: 'template-icon', value: templateKey };

  return { type: 'fallback', value: 'ledger' };
}
