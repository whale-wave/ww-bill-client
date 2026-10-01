import type { ElementType, ReactNode } from 'react';
import './record-detail-chip.scss';

/** The host owns the button/picker event; this content only arranges its icon and label. */
export function RecordDetailChipContent({ icon, children, primitive: Label = 'span' }: { icon: ReactNode; children: ReactNode; primitive?: ElementType }) {
  return (
    <>
      {icon}
      <Label>{children}</Label>
    </>
  );
}
