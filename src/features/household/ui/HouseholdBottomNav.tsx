import type { FC } from 'react';
import { PieOutline, UnorderedListOutline } from 'antd-mobile-icons';
import './household-shell.scss';

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
  <nav className="household-bottom-nav">
    <button className={active === 'details' ? 'is-active' : ''} onClick={onDetails} type="button">
      <UnorderedListOutline className="mx-auto mb-1 block text-xl" />
      {detailsLabel}
    </button>
    <button className={active === 'charts' ? 'is-active' : ''} onClick={onCharts} type="button">
      <PieOutline className="mx-auto mb-1 block text-xl" />
      {chartsLabel}
    </button>
  </nav>
);
