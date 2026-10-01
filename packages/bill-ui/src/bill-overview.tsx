import type { ElementType, ReactNode } from 'react';
import './bill-overview.scss';

export function BillOverviewVisual({ icon, metrics, period, title, primitives = { Box: 'div', Text: 'div' } }: {
  icon: ReactNode;
  metrics: ReactNode;
  period: ReactNode;
  title: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Box className="bill-overview">
      <Box className="bill-overview__heading">
        <Box className="bill-overview__icon">{icon}</Box>
        <Box>
          <Text className="bill-overview__title">{title}</Text>
          <Text className="bill-overview__period">{period}</Text>
        </Box>
      </Box>
      <Box className="bill-overview__metrics">{metrics}</Box>
    </Box>
  );
}
