import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import './page-header.scss';

interface PageHeaderProps {
  backLabel: string;
  onBack?: () => void;
  right?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ backLabel, onBack, right, title }: PageHeaderProps) {
  return (
    <header className="ww-ios-page-header relative z-20 shrink-0 px-[var(--ww-page-gutter)] pt-[max(6px,env(safe-area-inset-top))]" data-page-header>
      <div className="relative flex h-12 min-h-[48px] items-center justify-between">
        <div className="flex min-w-11 flex-1 items-center">
          {onBack && (
            <button aria-label={backLabel} className="bwm-nav-bar-back flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-solid border-border-primary bg-ww-surface p-0 text-primary-deep shadow-ww-xs backdrop-blur-[var(--ww-card-blur)]" onClick={onBack} type="button">
              <ChevronLeft size={19} />
            </button>
          )}
        </div>
        <h1 className="min-w-0 max-w-[220px] shrink truncate whitespace-nowrap text-center text-[16px] font-extrabold leading-6 text-ww-ink">{title}</h1>
        <div className="flex min-w-11 flex-1 items-center justify-end">{right}</div>
      </div>
    </header>
  );
}
