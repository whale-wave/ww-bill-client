import type { ReactNode } from 'react';
import whaleLoading from '@/assets/brand/whale-loading-加载图120x120.png';
import { cn } from '@/shared/lib';
import './page-loading-state.scss';

export interface PageLoadingStateProps {
  className?: string;
  compact?: boolean;
  label: ReactNode;
  testId?: string;
}

export function PageLoadingState({ className, compact = false, label, testId }: PageLoadingStateProps) {
  return (
    <div
      className={cn(
        'ww-page-loading flex min-h-[300px] flex-col items-center justify-center gap-3 text-[13px] font-semibold text-ww-mid',
        compact && 'min-h-[160px]',
        className,
      )}
      data-testid={testId}
      role="status"
    >
      <img
        alt=""
        className={cn('ww-page-loading__whale', compact ? 'h-10 w-10' : 'h-14 w-14')}
        src={whaleLoading}
      />
      <span>{label}</span>
    </div>
  );
}
