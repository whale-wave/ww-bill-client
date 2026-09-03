import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface FieldFrameProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function FieldFrame({ children, className, disabled, error }: FieldFrameProps) {
  return (
    <div
      className={cn(
        'flex min-h-[48px] items-center gap-3 rounded-[var(--ww-radius-control)] border border-solid border-border-primary bg-ww-surface-raised px-[var(--ww-card-padding)] shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww focus-within:ring-2 focus-within:ring-primary-light/60',
        disabled && 'bg-ww-surface opacity-70',
        error && 'border-feedback-danger focus-within:border-feedback-danger',
        className,
      )}
    >
      {children}
    </div>
  );
}
