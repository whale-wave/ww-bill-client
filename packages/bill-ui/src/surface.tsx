import type { AriaAttributes, ElementType, ReactNode, Ref } from 'react';
import './surface.scss';

export type SurfaceMaterial = 'chrome' | 'content' | 'floating' | 'overlay' | 'raised';

export interface SurfacePresentationProps<Element = unknown> extends AriaAttributes {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
  children?: ReactNode;
  className?: string;
  id?: string;
  material?: SurfaceMaterial;
  primitive?: ElementType;
  rootRef?: Ref<Element>;
  title?: string;
}

/** Material and children only; the host owns interaction and lifecycle. */
export function SurfacePresentation<Element = unknown>({
  children,
  className,
  material = 'content',
  primitive: Root = 'section',
  rootRef,
  ...attributes
}: SurfacePresentationProps<Element>) {
  return (
    <Root {...attributes} className={`ww-surface ww-surface--${material}${className ? ` ${className}` : ''}`} ref={rootRef}>
      {children}
    </Root>
  );
}
