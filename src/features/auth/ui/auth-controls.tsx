import type { ReactNode } from 'react';
import { AuthPrimaryActionContent } from '@ww-bill/bill-ui';
import { cn } from '@/shared/lib';

interface AuthPrimaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  onClick: () => void;
  testId?: string;
}

export function AuthPrimaryButton({ children, disabled, loading, loadingLabel, onClick, testId }: AuthPrimaryButtonProps) {
  return (
    <button
      className="bill-auth-primary-action ww-theme-primary-action"
      data-testid={testId}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      onClick={onClick}
      type="button"
    >
      <AuthPrimaryActionContent loading={loading} loadingLabel={loadingLabel}>{children}</AuthPrimaryActionContent>
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
