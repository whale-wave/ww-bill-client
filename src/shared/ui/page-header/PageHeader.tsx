import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  backLabel: string;
  onBack?: () => void;
  right?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ backLabel, onBack, right, subtitle, title }: PageHeaderProps) {
  return (
    <header className="relative z-20 shrink-0 px-[18px] pt-[max(8px,env(safe-area-inset-top))]" data-page-header>
      <div className="relative flex min-h-[52px] items-center justify-center">
        {onBack && (
          <button
            aria-label={backLabel}
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs backdrop-blur-xl"
            onClick={onBack}
            type="button"
          >
            <ChevronLeft size={19} />
          </button>
        )}
        <div className="min-w-0 max-w-[220px] text-center">
          <h1 className="truncate text-[17px] font-extrabold leading-6 text-ww-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[10px] font-semibold text-ww-soft">{subtitle}</p>}
        </div>
        {right && <div className="absolute right-0 flex items-center">{right}</div>}
      </div>
    </header>
  );
}
