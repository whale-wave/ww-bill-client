import type { ElementType, ReactNode } from 'react';
import './brand-mark.scss';

export function BrandMarkVisual({ image, primitive: Box = 'span' }: { image: ReactNode; primitive?: ElementType }) {
  return <Box className="bill-brand-mark ww-theme-primary-action" aria-hidden="true">{image}</Box>;
}
