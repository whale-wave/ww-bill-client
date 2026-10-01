import type { ElementType, ReactNode } from 'react';
import './profile-summary.scss';

export function ProfileSummaryVisual({ action, avatar, metrics, name, title, primitives = { Box: 'div', Text: 'div' } }: {
  action?: ReactNode;
  avatar: ReactNode;
  metrics: ReactNode;
  name: ReactNode;
  title?: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Box className="bill-profile-summary">
      <Box className="bill-profile-summary__identity">
        {avatar}
        <Box className="bill-profile-summary__details">
          <Text className="bill-profile-summary__name">{name}</Text>
          {title && <Box className="bill-profile-summary__title">{title}</Box>}
          {action && <Box className="bill-profile-summary__action">{action}</Box>}
        </Box>
      </Box>
      <Box className="ww-user-summary-metrics bill-profile-summary__metrics">{metrics}</Box>
    </Box>
  );
}
