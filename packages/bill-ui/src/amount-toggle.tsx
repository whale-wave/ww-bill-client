import type { ElementType, ReactNode } from 'react';
import './amount-toggle.scss';

export function AmountToggleVisual({ icon, onClick, disabled, label = 'toggle amount visibility', primitive: Button = 'button' }: { icon: ReactNode; onClick: () => void; disabled?: boolean; label?: string; primitive?: ElementType }) {
  return <Button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={`bill-amount-toggle${disabled ? ' bill-amount-toggle--disabled' : ''}`}>{icon}</Button>;
}
