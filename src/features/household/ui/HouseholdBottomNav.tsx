import type { FC } from 'react';
import { BottomTabBarPresentation, DesignIcon } from '@/shared/ui';

interface HouseholdBottomNavProps {
  active: 'details' | 'charts';
  chartsLabel: string;
  detailsLabel: string;
  onCharts: () => void;
  onDetails: () => void;
}

export const HouseholdBottomNav: FC<HouseholdBottomNavProps> = ({
  active,
  chartsLabel,
  detailsLabel,
  onCharts,
  onDetails,
}) => (
  <BottomTabBarPresentation
    activeKey={active}
    ariaLabel={`${detailsLabel} / ${chartsLabel}`}
    items={[
      {
        activeIcon: <DesignIcon name="tab-detail-active" size={19} />,
        icon: <DesignIcon name="tab-detail" size={19} />,
        key: 'details',
        label: detailsLabel,
        onSelect: onDetails,
      },
      {
        activeIcon: <DesignIcon name="tab-chart-active" size={19} />,
        icon: <DesignIcon name="tab-chart" size={19} />,
        key: 'charts',
        label: chartsLabel,
        onSelect: onCharts,
      },
    ]}
  />
);
