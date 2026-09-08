import type { FC } from 'react';
import type { PersonalTabSwipePage } from '@/widgets/layout';
import { LoginGuard } from '@/features/auth';
import ChartHomePage from '@/pages/chart/chart-home/ChartHomePage';
import DiscoveryPage from '@/pages/discovery/DiscoveryPage';
import MinePage from '@/pages/mine/MinePage';
import DetailPage from '@/pages/record/detail/DetailPage';
import { PersonalTabSwipeNavigation } from '@/widgets/layout';

const PERSONAL_TAB_PAGES: readonly PersonalTabSwipePage[] = [
  { content: <DetailPage />, key: 'detail' },
  { content: <ChartHomePage />, key: 'chart' },
  { content: <DiscoveryPage />, key: 'discovery' },
  { content: <MinePage />, key: 'mine' },
];

const PersonalTabRouteLayout: FC = () => {
  return (
    <LoginGuard>
      <PersonalTabSwipeNavigation pages={PERSONAL_TAB_PAGES} />
    </LoginGuard>
  );
};

export default PersonalTabRouteLayout;
