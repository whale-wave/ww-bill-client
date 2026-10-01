export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'compact' | 'medium' | 'large';

export const buttonVariantClassNames: Record<ButtonVariant, string> = {
  danger: 'bg-feedback-danger text-white shadow-ww',
  ghost: 'bg-transparent text-primary-deep',
  primary: 'bg-primary text-white shadow-ww',
  secondary: 'border border-solid border-border-primary bg-ww-surface-raised text-primary-deep shadow-ww',
};

const sizes: Record<ButtonSize, string> = {
  compact: 'min-h-[var(--ww-component-button-hit-target-min)] rounded-[var(--ww-component-button-radius-compact)] p-0',
  large: 'h-[var(--ww-component-button-height-large)] gap-[var(--ww-component-button-gap-default)] rounded-[var(--ww-component-button-radius-large)] px-[var(--ww-component-button-padding-x-large)] text-[length:var(--ww-component-button-font-size-large)]',
  medium: 'h-[var(--ww-component-button-height-medium)] gap-[var(--ww-component-button-gap-default)] rounded-[var(--ww-component-button-radius-medium)] px-[var(--ww-component-button-padding-x-medium)] text-[length:var(--ww-component-button-font-size-medium)]',
};

export interface ButtonAppearance {
  fullWidth?: boolean;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/** Host button owns native semantics, events, disabled state, and refs. */
export function buttonPresentationClassNames({ fullWidth = false, loading = false, size = 'medium', variant = 'primary' }: ButtonAppearance) {
  return [
    `bill-button bill-button--${size} bill-button--${variant}`,
    'inline-flex items-center justify-center border-0 font-extrabold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-45',
    sizes[size],
    size !== 'compact' ? buttonVariantClassNames[variant] : '',
    fullWidth ? 'bill-button--full w-full' : '',
    loading ? 'cursor-wait' : '',
  ].filter(Boolean).join(' ');
}
