import type { FC } from 'react';
import type { LedgerKind, LedgerTemplateKey } from '../types';
import {
  BriefcaseBusiness,
  Building2,
  ReceiptText,
  Settings2,
  Store,
  UsersRound,
} from 'lucide-react';
import appLogo from '@/assets/brand/whale-logo-surface.png';
import ledgerFallbackIcon from '@/assets/icons/figma/ledger.svg';
import { resolveLedgerVisual } from '../lib/resolveLedgerVisual';
import { LedgerIconGlyph } from './LedgerIconGlyph';

interface LedgerVisualIconProps {
  templateKey?: LedgerTemplateKey;
  iconKey?: string | null;
  kind?: LedgerKind;
  className?: string;
}

const templateIcons: Record<Exclude<LedgerTemplateKey, 'system-default'>, FC<{ className?: string }>> = {
  'business': BriefcaseBusiness,
  'company': Building2,
  'custom': Settings2,
  'micro-business': Store,
  'reimbursement': ReceiptText,
  'team': UsersRound,
};

export const LedgerVisualIcon: FC<LedgerVisualIconProps> = ({
  className,
  iconKey,
  kind,
  templateKey,
}) => {
  const visual = resolveLedgerVisual({ iconKey, kind, templateKey });

  if (visual.type === 'system-logo')
    return <img alt="" className="h-full w-full object-cover" src={appLogo} />;

  if (visual.type === 'fallback')
    return <img alt="" className={className} src={ledgerFallbackIcon} />;

  if (visual.type === 'ledger-icon')
    return <LedgerIconGlyph className={className} iconKey={visual.value} />;

  const Icon = templateIcons[visual.value];
  return <Icon aria-hidden="true" className={className} />;
};
