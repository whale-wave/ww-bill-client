import type { ElementType, ReactNode } from 'react';
import './page-loading.scss';

export function PageLoadingVisual({ label, image, compact = false, className = '', testId, primitives = {} }: {
  label: ReactNode;
  image: ReactNode;
  compact?: boolean;
  className?: string;
  testId?: string;
  primitives?: { Box?: ElementType; Text?: ElementType };
}) {
  const { Box = 'div', Text = 'span' } = primitives;
  return (
    <Box className={`ww-page-loading bill-page-loading${compact ? ' bill-page-loading--compact' : ''} ${className}`} data-testid={testId} role="status">
      <Box className="ww-page-loading__whale bill-page-loading__whale">{image}</Box>
      <Text>{label}</Text>
    </Box>
  );
}
