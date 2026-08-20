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
        'flex min-h-[54px] items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww focus-within:ring-2 focus-within:ring-primary-light/60',
        disabled && 'bg-white/50 opacity-70',
        error && 'border-[#d85e7b] focus-within:border-[#d85e7b]',
        className,
      )}
    >
      {children}
    </div>
  );
}
