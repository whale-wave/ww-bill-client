import type { ReactNode } from 'react';
import { SheetHeadingVisual } from '@ww-bill/bill-ui';
import { X } from 'lucide-react';

export interface SheetHeaderProps {
  closeLabel: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  title: string;
}

export function SheetHeader({ closeLabel, description, icon, onClose, title }: SheetHeaderProps) {
  return <SheetHeadingVisual title={title} description={description} icon={icon} closeLabel={closeLabel} onClose={onClose} closeIcon={<X size={18} />} />;
}
