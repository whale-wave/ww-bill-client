import type { FC } from 'react';
import { PieOutline, UnorderedListOutline } from 'antd-mobile-icons';
import { BottomTabBarPresentation } from '@/shared/ui';

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
        icon: <UnorderedListOutline />,
        key: 'details',
        label: detailsLabel,
        onSelect: onDetails,
      },
      {
        icon: <PieOutline />,
        key: 'charts',
        label: chartsLabel,
        onSelect: onCharts,
      },
    ]}
  />
);
