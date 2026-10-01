import type { ReactNode } from 'react';
import { EmptyStateVisual } from '@ww-bill/bill-ui';

export interface IllustratedEmptyStateProps {
  actionLabel?: ReactNode;
  accentIcon?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon: ReactNode;
  onAction?: () => void;
  testId?: string;
  title: ReactNode;
  variant?: 'default' | 'quiet';
}

export function IllustratedEmptyState({
  actionLabel,
  accentIcon,
  className,
  description,
  icon,
  onAction,
  testId,
  title,
  variant = 'default',
}: IllustratedEmptyStateProps) {
  return (
    <EmptyStateVisual
      accentIcon={accentIcon}
      className={className}
      description={description}
      icon={icon}
      testId={testId}
      title={title}
      variant={variant}
      action={actionLabel && onAction ? <button className="bill-empty-state__action" onClick={onAction} type="button">{actionLabel}</button> : undefined}
    />
  );
}
