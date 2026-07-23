import type { LedgerCapability, LedgerListItem, LedgerRole, LedgerStatus } from '@/entities/ledger';
import { LedgerKind } from '@/entities/ledger';

export interface PersonalLedgerSwitcherItem {
  type: 'personal';
  label: '默认账本';
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
  themeKey: string;
  status: LedgerStatus;
  myRole: LedgerRole;
}

export type LedgerSwitcherItem
  = | PersonalLedgerSwitcherItem
    | CustomLedgerSwitcherItem;

export function toLedgerSwitcherItems(list: LedgerListItem[]): LedgerSwitcherItem[] {
  const systemDefault = list.find(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT);
  const personal: PersonalLedgerSwitcherItem = {
    label: '默认账本',
    recordCount: systemDefault?.recordCount ?? 0,
    type: 'personal',
  };
  const custom = list
    .filter(ledger => ledger.kind === LedgerKind.CUSTOM)
    .map<CustomLedgerSwitcherItem>(ledger => ({
      activeMemberCount: ledger.activeMemberCount,
      capabilities: ledger.capabilities,
      iconKey: ledger.iconKey,
      label: ledger.name,
      ledgerId: ledger.id,
      myRole: ledger.myRole,
      recordCount: ledger.recordCount,
      status: ledger.status,
      themeKey: ledger.themeKey,
      type: 'custom',
    }));

  return [personal, ...custom];
}
