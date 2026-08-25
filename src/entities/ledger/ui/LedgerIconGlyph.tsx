import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LedgerIconKey } from '../model/ledger-icon';
import {
  BriefcaseBusiness,
  Building2,
  ReceiptText,
  Store,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { createElement } from 'react';

type LedgerIconComponent = ComponentType<LucideProps>;

const ledgerIconGlyphs: Record<LedgerIconKey, LedgerIconComponent> = {
  briefcase: BriefcaseBusiness,
  building: Building2,
  receipt: ReceiptText,
  store: Store,
  users: UsersRound,
  wallet: WalletCards,
};

export interface LedgerIconGlyphProps extends Omit<LucideProps, 'ref'> {
  iconKey: LedgerIconKey;
}

export function LedgerIconGlyph({ iconKey, ...props }: LedgerIconGlyphProps) {
  return createElement(ledgerIconGlyphs[iconKey], {
    'aria-hidden': true,
    ...props,
  });
}
