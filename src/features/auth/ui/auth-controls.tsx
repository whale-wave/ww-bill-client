import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface AuthPrimaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  testId?: string;
}

export function AuthPrimaryButton({ children, disabled, onClick, testId }: AuthPrimaryButtonProps) {
  return (
    <button
      className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[16px] border-0 bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] text-[15px] font-bold text-white shadow-ww transition active:opacity-85 disabled:cursor-not-allowed disabled:opacity-45"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

interface AuthSegmentedControlProps<Value extends string> {
  ariaLabel: string;
  onChange: (value: Value) => void;
  options: readonly { label: ReactNode; value: Value }[];
  value: Value;
}

export function AuthSegmentedControl<Value extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: AuthSegmentedControlProps<Value>) {
  return (
    <div
      aria-label={ariaLabel}
      className="mb-5 grid h-11 grid-cols-2 gap-1 rounded-[14px] border border-border-primary bg-primary-light/20 p-1"
      role="tablist"
    >
      {options.map(option => (
        <button
          aria-selected={option.value === value}
          className={cn(
            'rounded-[11px] border-0 bg-transparent px-2 text-[13px] font-semibold text-ww-mid',
            option.value === value && 'bg-white font-bold text-primary-deep shadow-ww-xs',
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
