import type { LedgerIconKey } from '../model/ledger-icon';
import type { LedgerTemplateKey } from '../types';
import { isLedgerIconKey } from '../model/ledger-icon';
import { isCreatableLedgerTemplateKey, LedgerKind } from '../types';

export type ResolvedLedgerVisual
  = | { type: 'system-logo'; value: 'whale-wave' }
    | { type: 'ledger-icon'; value: LedgerIconKey }
    | { type: 'template-icon'; value: Exclude<LedgerTemplateKey, 'system-default'> }
    | { type: 'fallback'; value: 'ledger' };

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
