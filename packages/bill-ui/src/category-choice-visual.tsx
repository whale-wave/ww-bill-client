import type { CSSProperties, ElementType, ReactNode } from 'react';
import { Fragment } from 'react';
import './category-choice-visual.scss';

export interface CategoryChoicePrimitives {
  Box: ElementType;
  Text: ElementType;
}

export interface CategoryChoiceVisualProps {
  checkIcon?: ReactNode;
  hasChildren?: boolean;
  hint?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  isSelected?: boolean;
  label: ReactNode;
  primitives?: CategoryChoicePrimitives;
}

const webPrimitives: CategoryChoicePrimitives = { Box: 'span', Text: 'span' };

export function CategoryChoiceVisual({
  checkIcon,
  hasChildren = false,
  hint,
  icon,
  iconClassName,
  iconStyle,
  isSelected = false,
  label,
  primitives = webPrimitives,
}: CategoryChoiceVisualProps) {
  const { Box, Text } = primitives;
  return (
    <Fragment>
      <Box className={`bill-category-choice__icon record-editor-category-icon${iconClassName ? ` ${iconClassName}` : ''}`} style={iconStyle}>
        {icon}
      </Box>
      <Text className="bill-category-choice__label record-editor-category-label">{label}</Text>
      {hint && <Text className="bill-category-choice__hint">{hint}</Text>}
      {isSelected && (
        <Box aria-hidden="true" className="bill-category-choice__check record-editor-category-check" data-record-editor-category-check>
          {checkIcon ?? '✓'}
        </Box>
      )}
      {hasChildren && <Text className="bill-category-choice__children">•••</Text>}
    </Fragment>
  );
}
