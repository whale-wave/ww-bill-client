import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface SheetHeaderProps {
  closeLabel: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  title: string;
}

export function SheetHeader({ closeLabel, description, icon, onClose, title }: SheetHeaderProps) {
  return (
    <header className="ww-sheet-header flex shrink-0 items-center gap-3 px-4 py-3">
      {icon && <span className="ww-sheet-header__icon flex h-10 w-10 shrink-0 items-center justify-center text-primary-deep">{icon}</span>}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[16px] font-black text-ww-ink">{title}</h2>
        {description && <p className="mt-0.5 truncate text-[11px] font-semibold text-ww-mid">{description}</p>}
      </div>
      <button
        aria-label={closeLabel}
        className="ww-sheet-header__close flex h-11 w-11 shrink-0 items-center justify-center border-0 p-0 text-ww-mid"
        onClick={onClose}
        type="button"
      >
        <X size={18} />
      </button>
    </header>
  );
}
