import type { LedgerCapability, LedgerListItem, LedgerRole, LedgerStatus, LedgerTemplateKey } from '@/entities/ledger';
import { LedgerKind } from '@/entities/ledger';

export interface PersonalLedgerSwitcherItem {
  iconKey?: string;
  kind: LedgerKind;
  templateKey?: LedgerTemplateKey;
  type: 'personal';
  recordCount: number;
}

export interface CustomLedgerSwitcherItem {
  type: 'custom';
  ledgerId: string;
  label: string;
  recordCount: number;
  activeMemberCount: number;
  capabilities: readonly LedgerCapability[];
  iconKey: string;
  kind: LedgerKind;
  themeKey: string;
  templateKey?: LedgerTemplateKey;
  status: LedgerStatus;
  myRole: LedgerRole;
}

export type LedgerSwitcherItem
  = | PersonalLedgerSwitcherItem
    | CustomLedgerSwitcherItem;

export function toLedgerSwitcherItems(list: LedgerListItem[]): LedgerSwitcherItem[] {
  const systemDefault = list.find(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT);
  const personal: PersonalLedgerSwitcherItem = {
    iconKey: systemDefault?.iconKey,
    kind: LedgerKind.SYSTEM_DEFAULT,
    recordCount: systemDefault?.recordCount ?? 0,
    templateKey: systemDefault?.templateKey,
    type: 'personal',
  };
  const custom = list
    .filter(ledger => ledger.kind === LedgerKind.CUSTOM)
    .map<CustomLedgerSwitcherItem>(ledger => ({
      activeMemberCount: ledger.activeMemberCount,
      capabilities: ledger.capabilities,
      iconKey: ledger.iconKey,
      kind: ledger.kind,
      label: ledger.name,
      ledgerId: ledger.id,
      myRole: ledger.myRole,
      recordCount: ledger.recordCount,
      status: ledger.status,
      themeKey: ledger.themeKey,
      templateKey: ledger.templateKey,
      type: 'custom',
    }));

  return [personal, ...custom];
}
