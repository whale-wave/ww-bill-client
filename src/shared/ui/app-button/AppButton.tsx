import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: AppButtonVariant;
}

const variantClassNames: Record<AppButtonVariant, string> = {
  danger: 'bg-feedback-danger text-white shadow-ww disabled:opacity-45',
  ghost: 'bg-transparent text-primary-deep disabled:opacity-45',
  primary: 'bg-primary text-white shadow-ww disabled:opacity-45',
  secondary: 'border border-solid border-border-primary bg-ww-surface-raised text-primary-deep shadow-ww disabled:opacity-45',
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(({
  children,
  className,
  disabled = false,
  fullWidth = false,
  loading = false,
  loadingLabel,
  type = 'button',
  variant = 'primary',
  ...buttonProps
}, ref) => {
  const isDisabled = disabled || loading;
  const content = loading ? (loadingLabel ?? children) : children;

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex h-[48px] items-center justify-center gap-2 rounded-[var(--ww-radius-control)] border-0 px-4 text-[14px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed',
        variantClassNames[variant],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className,
      )}
      disabled={isDisabled}
      ref={ref}
      type={type}
    >
      {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      <span className="inline-flex items-center justify-center gap-2">{content}</span>
    </button>
  );
});
