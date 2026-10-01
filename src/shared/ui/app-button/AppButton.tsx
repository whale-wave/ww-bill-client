import type { ButtonSize, ButtonVariant } from '@ww-bill/bill-ui';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonContent, buttonPresentationClassNames } from '@ww-bill/bill-ui';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib';

export type AppButtonVariant = ButtonVariant;
export type AppButtonSize = ButtonSize;

export interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  size?: AppButtonSize;
  variant?: AppButtonVariant;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(({
  children,
  className,
  disabled = false,
  fullWidth = false,
  loading = false,
  loadingLabel,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={cn(buttonPresentationClassNames({ size, variant, fullWidth, loading }), isDisabled && 'bill-button--disabled', className)}
      disabled={isDisabled}
      ref={ref}
      type={type}
    >
      <ButtonContent fullWidth={fullWidth} loading={loading} loadingLabel={loadingLabel} size={size} variant={variant}>
        {children}
      </ButtonContent>
    </button>
  );
});
