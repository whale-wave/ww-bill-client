import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import './ios-chip.scss';

export interface IosChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'fill' | 'outline';
}

/** Source-adapted from Konsta ChipClasses iOS proportions. */
export function IosChip({ children, className, variant = 'fill', ...props }: IosChipProps) {
  return <span {...props} className={cn('ww-ios-chip', `ww-ios-chip--${variant}`, className)}>{children}</span>;
}
