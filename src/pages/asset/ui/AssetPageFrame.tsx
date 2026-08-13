import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { PageHeader } from '@/shared/ui';

interface AssetPageFrameProps {
  backLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  mainClassName?: string;
  onBack: () => void;
  right?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

export function AssetPageFrame({
  backLabel,
  children,
  footer,
  mainClassName,
  onBack,
  right,
  subtitle,
  title,
}: AssetPageFrameProps) {
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-10 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader
        backLabel={backLabel}
        onBack={onBack}
        right={right}
        subtitle={subtitle}
        title={title}
      />
      <main className={cn('relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))] pt-2', mainClassName)}>
        <div className="mx-auto w-full max-w-[520px]">
          {children}
        </div>
      </main>
      {footer}
    </div>
  );
}
