import type { ElementType, ReactNode } from 'react';
import './chart-ranking.scss';

export function RankingRowVisual({ amount, icon, label, percentage, progress, primitives = { Box: 'div', Text: 'div' } }: {
  amount: ReactNode;
  icon: ReactNode;
  label: ReactNode;
  percentage: ReactNode;
  progress: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Box className="bill-ranking">
      <Box className="bill-ranking__icon">{icon}</Box>
      <Box className="bill-ranking__content">
        <Box className="bill-ranking__row">
          <Text className="bill-ranking__label">{label}</Text>
          <Box className="bill-ranking__values">
            <Text className="bill-ranking__percentage">
              {percentage}
              %
            </Text>
            <Text className="bill-ranking__amount">{amount}</Text>
          </Box>
        </Box>
        <Box className="bill-ranking__track">{progress}</Box>
      </Box>
    </Box>
  );
}

export function ProgressVisual({ color = 'var(--ww-theme-color)', fraction, primitive: Box = 'div' }: { color?: string; fraction: number; primitive?: ElementType }) {
  return <Box className="bill-progress"><Box className="bill-progress__fill" style={{ background: color, minWidth: 4, width: `${fraction * 100}%` }} /></Box>;
}
