import type { HTMLAttributes, PropsWithChildren } from 'react';

export type GradientPanelTone = 'blue' | 'pink' | 'purple' | 'white';
export type GradientPanelSurface = 'aurora' | 'blush' | 'chart' | 'glass' | 'ice' | 'lavender' | 'vip';
export type GradientPanelElevation = 'floating' | 'high' | 'low' | 'none' | 'standard';

export interface GradientPanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section';
  elevation?: GradientPanelElevation;
  surface?: GradientPanelSurface;
  tone?: GradientPanelTone;
}

const toneClassNames: Record<GradientPanelTone, string> = {
  blue: 'bg-[color:var(--ww-surface-tint-color)]',
  pink: 'bg-[color:var(--ww-surface-accent-color)]',
  purple: 'bg-[color:var(--ww-surface-secondary-color)]',
  white: 'bg-ww-surface',
};

const surfaceClassNames: Record<GradientPanelSurface, string> = {
  aurora: 'ww-surface-aurora',
  blush: 'ww-surface-blush',
  chart: 'ww-surface-chart',
  glass: 'border-border-primary bg-ww-surface',
  ice: 'ww-surface-ice',
  lavender: 'ww-surface-lavender',
  vip: 'ww-surface-vip',
};

const elevationClassNames: Record<GradientPanelElevation, string> = {
  floating: 'shadow-ww-floating',
  high: 'shadow-ww-lg',
  low: 'shadow-ww-xs',
  none: '',
  standard: 'shadow-ww',
};

export function GradientPanel({
  as: Component = 'section',
  elevation = 'standard',
  surface,
  tone = 'white',
  className = '',
  children,
  ...props
}: PropsWithChildren<GradientPanelProps>) {
  return (
    <Component
      className={`rounded-[var(--ww-radius-card)] border backdrop-blur-[var(--ww-card-blur)] ${elevationClassNames[elevation]} ${surface ? surfaceClassNames[surface] : `border-border-primary ${toneClassNames[tone]}`} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
