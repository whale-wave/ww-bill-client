import type { ElementType, ReactNode } from 'react';
import type { ButtonAppearance } from './button-appearance';
import { buttonVariantClassNames } from './button-appearance';

import './button-content.scss';

export interface ButtonContentProps extends ButtonAppearance {
  children?: ReactNode;
  loadingLabel?: ReactNode;
  primitive?: ElementType;
}

export function ButtonContent({ children, fullWidth = false, loading = false, loadingLabel, primitive: Box = 'span', size = 'medium', variant = 'primary' }: ButtonContentProps) {
  const className = [
    'bill-button__content inline-flex items-center justify-center',
    size === 'compact' ? 'h-[var(--ww-component-button-height-compact)] gap-[var(--ww-component-button-gap-compact)] rounded-[var(--ww-component-button-radius-compact)] px-[var(--ww-component-button-padding-x-compact)] text-[length:var(--ww-component-button-font-size-compact)]' : '',
    size === 'compact' ? buttonVariantClassNames[variant] : '',
    size === 'compact' && variant !== 'ghost' ? 'shadow-ww-xs' : '',
    size === 'compact' && fullWidth ? 'w-full' : '',
  ].filter(Boolean).join(' ');
  return (
    <Box className={className}>
      {loading && <Box aria-hidden="true" className="bill-button__spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {loading ? (loadingLabel ?? children) : children}
    </Box>
  );
}
