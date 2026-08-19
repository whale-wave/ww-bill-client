import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib';

export interface ActionFieldProps {
  className?: string;
  disabled?: boolean;
  label: ReactNode;
  onClick?: () => void;
  testId?: string;
  value: ReactNode;
}

export function ActionField({ className, disabled, label, onClick, testId, value }: ActionFieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{label}</span>
      <button
        className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 text-left shadow-ww-xs transition active:bg-primary-light/25 disabled:opacity-45"
        data-testid={testId}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ww-ink">{value}</span>
        <ChevronRight aria-hidden="true" className="shrink-0 text-[#9eb1bd]" size={18} />
      </button>
    </div>
  );
}
