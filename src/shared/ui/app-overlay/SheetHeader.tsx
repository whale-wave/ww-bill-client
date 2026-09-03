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
    <header className="flex shrink-0 items-center gap-3 border-b border-solid border-border-primary bg-white/90 px-4 py-3 backdrop-blur-xl">
      {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light/70 text-primary-deep">{icon}</span>}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[16px] font-black text-ww-ink">{title}</h2>
        {description && <p className="mt-0.5 truncate text-[11px] font-semibold text-ww-mid">{description}</p>}
      </div>
      <button
        aria-label={closeLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border-0 bg-primary-light/70 p-0 text-ww-soft transition active:bg-primary-light"
        onClick={onClose}
        type="button"
      >
        <X size={18} />
      </button>
    </header>
  );
}
