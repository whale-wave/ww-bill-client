import type { ButtonHTMLAttributes, ComponentProps, ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react';
import { Button as KonstaButton } from 'konsta/react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type AppButtonSize = 'compact' | 'medium' | 'large';

export interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  size?: AppButtonSize;
  variant?: AppButtonVariant;
}

const variantClassNames: Record<AppButtonVariant, string> = {
  danger: 'bg-feedback-danger text-white shadow-ww active:!bg-feedback-danger',
  ghost: 'bg-transparent text-primary-deep',
  primary: 'bg-primary text-white shadow-ww active:!bg-primary-deep',
  secondary: 'border border-solid border-border-primary bg-ww-surface-raised text-primary-deep shadow-ww active:!bg-ww-surface-tint',
};

const sizeClassNames: Record<AppButtonSize, string> = {
  compact: 'min-h-[var(--ww-component-button-hit-target-min)] rounded-[var(--ww-component-button-radius-compact)] p-0',
  large: 'h-[var(--ww-component-button-height-large)] gap-[var(--ww-component-button-gap-default)] rounded-[var(--ww-component-button-radius-large)] px-[var(--ww-component-button-padding-x-large)] text-[length:var(--ww-component-button-font-size-large)]',
  medium: 'h-[var(--ww-component-button-height-medium)] gap-[var(--ww-component-button-gap-default)] rounded-[var(--ww-component-button-radius-medium)] px-[var(--ww-component-button-padding-x-medium)] text-[length:var(--ww-component-button-font-size-medium)]',
};

interface KonstaButtonHandle {
  el: HTMLButtonElement | null;
}

const KonstaButtonWithRef = KonstaButton as unknown as ForwardRefExoticComponent<
  ComponentProps<typeof KonstaButton> & RefAttributes<KonstaButtonHandle>
>;

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
  const content = loading ? (loadingLabel ?? children) : children;
  const htmlButtonProps = { ...buttonProps, type } as ComponentProps<typeof KonstaButton>;

  return (
    <KonstaButtonWithRef
      {...htmlButtonProps}
      aria-busy={loading || undefined}
      clear={variant === 'ghost'}
      className={cn(
        'ww-app-button inline-flex items-center justify-center border-0 font-extrabold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-45',
        sizeClassNames[size],
        size !== 'compact' && variantClassNames[variant],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className,
      )}
      disabled={isDisabled}
      outline={variant === 'secondary'}
      ref={(handle) => {
        if (typeof ref === 'function')
          ref(handle?.el ?? null);
        else if (ref)
          ref.current = handle?.el ?? null;
      }}
    >
      <span className={cn(
        'inline-flex items-center justify-center',
        size === 'compact'
        && 'h-[var(--ww-component-button-height-compact)] gap-[var(--ww-component-button-gap-compact)] rounded-[var(--ww-component-button-radius-compact)] px-[var(--ww-component-button-padding-x-compact)] text-[length:var(--ww-component-button-font-size-compact)]',
        size === 'compact' && variantClassNames[variant],
        size === 'compact' && variant !== 'ghost' && 'shadow-ww-xs',
        size === 'compact' && fullWidth && 'w-full',
      )}
      >
        {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {content}
      </span>
    </KonstaButtonWithRef>
  );
});
