import type { ElementType, ReactNode } from 'react';
import './action-menu.scss';

export function ActionMenuLayout({ children, columns = 4, variant = 'card', className = '', label, primitive: Root = 'div' }: {
  children: ReactNode;
  columns?: number;
  variant?: string;
  className?: string;
  label?: string;
  primitive?: ElementType;
}) {
  return <Root aria-label={label} role="group" className={`ww-action-menu-card bill-action-menu bill-action-menu--${variant} bill-action-menu--columns-${columns} ${variant === 'detail-shortcuts' || variant === 'gradient-tiles' ? 'overflow-x-auto' : ''} ${className}`}>{children}</Root>;
}

export function ActionMenuItemContent({ badge, icon, label, tone = 'blue', variant = 'card', primitives = { Box: 'span', Text: 'span' } }: {
  badge?: ReactNode;
  icon: ReactNode;
  label: ReactNode;
  tone?: string;
  variant?: string;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <>
      <Box className="bill-action-menu__badge">{badge}</Box>
      <Box className={`${variant === 'detail-shortcuts' ? 'ww-summary-shortcut-icon' : 'ww-action-menu-card__icon'} bill-action-menu__icon bill-action-menu__icon--${variant} bill-action-menu__tone--${tone}`} data-action-menu-tone={tone} data-action-menu-variant={variant}>{icon}</Box>
      <Text className={`bill-action-menu__label bill-action-menu__label--${variant}`}>{label}</Text>
    </>
  );
}
