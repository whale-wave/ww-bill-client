import type { ReactNode } from 'react';
import { Button, Navbar } from 'konsta/react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  backLabel: string;
  onBack?: () => void;
  right?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ backLabel, onBack, right, title }: PageHeaderProps) {
  return (
    <Navbar
      bgClassName="!bg-transparent"
      centerTitle
      className="!relative z-20 shrink-0 px-[var(--ww-page-gutter)] !pt-[max(6px,env(safe-area-inset-top))]"
      data-page-header
      innerClassName="!h-12 !min-h-[48px] !overflow-visible !px-0"
      left={onBack
        ? (
            <Button
              aria-label={backLabel}
              className="bwm-nav-bar-back !flex !h-11 !w-11 !shrink-0 !rounded-full !border !border-solid !border-border-primary !bg-ww-surface !p-0 !text-primary-deep !shadow-ww-xs backdrop-blur-[var(--ww-card-blur)]"
              clear
              inline
              onClick={onBack}
            >
              <ChevronLeft size={19} />
            </Button>
          )
        : undefined}
      leftClassName="!m-0"
      outline={false}
      right={right}
      rightClassName="!m-0"
      title={<h1 className="max-w-[220px] truncate text-[16px] font-extrabold leading-6 text-ww-ink">{title}</h1>}
      titleClassName="!leading-6"
      translucent={false}
    />
  );
}
