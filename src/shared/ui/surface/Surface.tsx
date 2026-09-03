import type { AriaAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib';

export type SurfaceMaterial = 'chrome' | 'content' | 'floating' | 'overlay' | 'raised';
export type SurfaceElement = 'article' | 'div' | 'section';

interface SurfaceDataAttributes {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * Presentation-only surface. Interactive controls own their native semantics;
 * surfaces deliberately do not expose event, role, tabIndex, or style props.
 */
export interface SurfaceProps extends AriaAttributes, SurfaceDataAttributes {
  as?: SurfaceElement;
  children?: ReactNode;
  className?: string;
  id?: string;
  material?: SurfaceMaterial;
  title?: string;
}

export const Surface = forwardRef<HTMLElement, SurfaceProps>(({
  as: Component = 'section',
  children,
  className,
  material = 'content',
  ...presentationAttributes
}, ref) => {
  return (
    <Component
      {...presentationAttributes}
      className={cn('ww-surface', `ww-surface--${material}`, className)}
      ref={ref as never}
    >
      {children}
    </Component>
  );
});
