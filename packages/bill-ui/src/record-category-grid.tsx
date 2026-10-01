import type { ElementType, ReactNode } from 'react';
import './record-category-grid.scss';

export function RecordCategoryGrid({ children, variant = 'root', primitive: Box = 'div' }: { children: ReactNode; variant?: 'root' | 'children'; primitive?: ElementType }) {
  return <Box className={`bill-record-category-grid bill-record-category-grid--${variant}`} data-record-editor-category-grid={variant === 'root' ? '' : undefined}>{children}</Box>;
}

export function RecordCategoryErrorVisual({ label, icon, action, primitives = { Box: 'div', Text: 'span' } }: {
  label: ReactNode;
  icon: ReactNode;
  action?: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Box className="bill-record-category-error">
      <Box className="bill-record-category-error__message" role="alert">
        {icon}
        <Text>{label}</Text>
      </Box>
      {action}
    </Box>
  );
}
