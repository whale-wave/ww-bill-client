import type { SurfaceMaterial, SurfacePresentationProps } from '@ww-bill/bill-ui';
import { SurfacePresentation } from '@ww-bill/bill-ui';
import { forwardRef } from 'react';

export type { SurfaceMaterial } from '@ww-bill/bill-ui';
export type SurfaceElement = 'article' | 'div' | 'section';

/**
 * Presentation-only surface. Interactive controls own their native semantics;
 * surfaces deliberately do not expose event, role, tabIndex, or style props.
 */
export interface SurfaceProps extends Omit<SurfacePresentationProps<HTMLElement>, 'primitive' | 'rootRef'> {
  as?: SurfaceElement;
  material?: SurfaceMaterial;
}

export const Surface = forwardRef<HTMLElement, SurfaceProps>(({
  as: Component = 'section',
  children,
  className,
  material = 'content',
  ...presentationAttributes
}, ref) => {
  return (
    <SurfacePresentation
      {...presentationAttributes}
      className={className}
      material={material}
      primitive={Component}
      rootRef={ref}
    >
      {children}
    </SurfacePresentation>
  );
});
