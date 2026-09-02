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
  aurora: 'border-[rgba(180,220,240,0.5)] bg-[linear-gradient(155.269deg,#c6e8f8_0%,#ddf2fc_45.617%,#f4e8f8_100%)]',
  blush: 'border-[rgba(240,180,210,0.4)] bg-[linear-gradient(156.999deg,#f8d8e8_3.6706%,#ffe8f2_50%,#fff4e8_96.329%)]',
  chart: 'border-[rgba(160,210,235,0.4)] bg-[linear-gradient(167.148deg,#d8f0fa_8.4861%,#ebf7ff_41.697%,#f8f2ff_91.514%)]',
  glass: 'border-border-primary bg-ww-surface',
  ice: 'border-[rgba(160,210,235,0.45)] bg-[linear-gradient(161.778deg,#c4e8f8_3.6706%,#e0f4ff_50%,#f0eeff_96.329%)]',
  lavender: 'border-[rgba(180,160,240,0.35)] bg-[linear-gradient(162.292deg,#e0d8ff_3.6706%,#eee8ff_50%,#f8f4ff_96.329%)]',
  vip: 'border-[rgba(180,170,240,0.35)] bg-[linear-gradient(171.941deg,#ede8ff_0%,#f5f2ff_100%)]',
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
