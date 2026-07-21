import type { FC } from 'react';
import type { LedgerTemplateKey } from '../types';
import {
  BillOutline,
  FileOutline,
  ReceiptOutline,
  SetOutline,
  ShopbagOutline,
  TeamOutline,
  UserContactOutline,
} from 'antd-mobile-icons';

interface LedgerVisualIconProps {
  templateKey?: LedgerTemplateKey;
  className?: string;
}

export const LedgerVisualIcon: FC<LedgerVisualIconProps> = ({
  className,
  templateKey,
}) => {
  switch (templateKey) {
    case 'business':
      return <ShopbagOutline className={className} />;
    case 'reimbursement':
      return <ReceiptOutline className={className} />;
    case 'company':
      return <FileOutline className={className} />;
    case 'team':
      return <TeamOutline className={className} />;
    case 'micro-business':
      return <UserContactOutline className={className} />;
    case 'custom':
      return <SetOutline className={className} />;
    default:
      return <BillOutline className={className} />;
  }
};
