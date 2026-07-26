import type { FC } from 'react';
import { PieOutline, UnorderedListOutline } from 'antd-mobile-icons';

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
  <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 border-0 border-t border-solid border-[#EBEBEB] bg-white py-2">
    <button className={`border-0 bg-white text-xs ${active === 'details' ? 'text-primary' : 'text-font-gray'}`} onClick={onDetails} type="button">
      <UnorderedListOutline className="mx-auto mb-1 block text-xl" />
      {detailsLabel}
    </button>
    <button className={`border-0 bg-white text-xs ${active === 'charts' ? 'text-primary' : 'text-font-gray'}`} onClick={onCharts} type="button">
      <PieOutline className="mx-auto mb-1 block text-xl" />
      {chartsLabel}
    </button>
  </nav>
);
