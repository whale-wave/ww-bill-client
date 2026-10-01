import type { ElementType, ReactNode } from 'react';
import './record-category-grid.scss';

export function RecordCategoryGrid({ children, variant = 'root', primitive: Box = 'div' }: { children: ReactNode; variant?: 'root' | 'children'; primitive?: ElementType }) {
  return <Box className={`bill-record-category-grid bill-record-category-grid--${variant}`} data-record-editor-category-grid={variant === 'root' ? '' : undefined}>{children}</Box>;
}
