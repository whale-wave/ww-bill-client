import type { FC } from 'react';
import type { LedgerTemplateKey } from '../types';
import {
  ContactRound,
  FileText,
  Notebook,
  Receipt,
  Settings2,
  ShoppingBag,
  UsersRound,
} from 'lucide-react';

interface LedgerTemplateIconProps {
  className?: string;
  templateKey?: LedgerTemplateKey;
}

export const LedgerTemplateIcon: FC<LedgerTemplateIconProps> = ({ className, templateKey }) => {
  switch (templateKey) {
    case 'business':
      return <ShoppingBag className={className} />;
    case 'reimbursement':
      return <Receipt className={className} />;
    case 'company':
      return <FileText className={className} />;
    case 'team':
      return <UsersRound className={className} />;
    case 'micro-business':
      return <ContactRound className={className} />;
    case 'custom':
      return <Settings2 className={className} />;
    default:
      return <Notebook className={className} />;
  }
};
