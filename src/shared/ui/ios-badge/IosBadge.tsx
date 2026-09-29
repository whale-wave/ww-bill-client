import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import './ios-badge.scss';

export interface IosBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
  tone?: 'primary' | 'accent';
}

/** Source-adapted from Konsta BadgeClasses, with project color tokens. */
export function IosBadge({ children, className, size = 'sm', tone = 'primary', ...props }: IosBadgeProps) {
  return <span {...props} className={cn('ww-ios-badge', `ww-ios-badge--${size}`, `ww-ios-badge--${tone}`, className)}>{children}</span>;
}
