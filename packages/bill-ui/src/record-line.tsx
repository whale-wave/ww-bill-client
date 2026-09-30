import type { ElementType, ReactNode } from 'react';
import './record-line.scss';

export interface RecordLinePrimitives {
  Box: ElementType;
  Text: ElementType;
}

export interface RecordLineProps {
  amount: ReactNode;
  amountTone?: 'expense' | 'income' | 'neutral';
  className?: string;
  icon: ReactNode;
  isLast?: boolean;
  primitives?: RecordLinePrimitives;
  subtitle?: ReactNode;
  title: ReactNode;
}

const webPrimitives: RecordLinePrimitives = { Box: 'div', Text: 'span' };

/** Display only: data, navigation, gestures and state belong to each platform. */
export function RecordLine({
  amount,
  amountTone = 'neutral',
  className,
  icon,
  isLast = false,
  primitives = webPrimitives,
  subtitle,
  title,
}: RecordLineProps) {
  const { Box, Text } = primitives;
  return (
    <Box className={`bill-record-line${className ? ` ${className}` : ''}`}>
      <Box className="bill-record-line__icon-area">
        <Box className="bill-record-line__icon">{icon}</Box>
      </Box>
      <Box className={`bill-record-line__body${isLast ? '' : ' bill-record-line__body--bordered'}`}>
        <Box className="bill-record-line__copy">
          <Text className="bill-record-line__title">{title}</Text>
          {subtitle && <Text className="bill-record-line__subtitle">{subtitle}</Text>}
        </Box>
        <Text className={`bill-record-line__amount bill-record-line__amount--${amountTone}`}>{amount}</Text>
      </Box>
    </Box>
  );
}
