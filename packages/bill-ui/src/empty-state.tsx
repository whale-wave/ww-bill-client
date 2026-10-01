import type { ElementType, ReactNode } from 'react';
import './empty-state.scss';

export function EmptyStateVisual({ action, accentIcon, className, description, icon, testId, title, variant = 'default', primitives = { Box: 'div', Title: 'h2', Description: 'p', Dot: 'span' } }: {
  action?: ReactNode;
  accentIcon?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon: ReactNode;
  testId?: string;
  title: ReactNode;
  variant?: 'default' | 'quiet';
  primitives?: { Box: ElementType; Title: ElementType; Description: ElementType; Dot: ElementType };
}) {
  const { Box, Title, Description, Dot } = primitives;
  return (
    <Box className={`bill-empty-state bill-empty-state--${variant}${className ? ` ${className}` : ''}`} data-empty-state-variant={variant} data-testid={testId}>
      <Box className="bill-empty-state__illustration" aria-hidden="true">
        <Box className="bill-empty-state__halo" />
        <Box className="bill-empty-state__icon">{icon}</Box>
        {accentIcon && <Box className="bill-empty-state__accent">{accentIcon}</Box>}
        {variant !== 'quiet' && (
          <>
            <Dot className="bill-empty-state__dot bill-empty-state__dot--pink" data-empty-state-decoration />
            <Dot className="bill-empty-state__dot bill-empty-state__dot--blue" data-empty-state-decoration />
          </>
        )}
      </Box>
      <Title className="bill-empty-state__title">{title}</Title>
      {description && <Description className="bill-empty-state__description">{description}</Description>}
      {action}
    </Box>
  );
}
