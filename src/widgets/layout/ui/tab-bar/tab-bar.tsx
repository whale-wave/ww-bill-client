import type { FC } from 'react';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import { BottomTabBarPresentation, Icon } from '@/shared/ui';

export type PersonalTabKey
  = | 'detail'
    | 'chart'
    | 'bookkeeping'
    | 'discovery'
    | 'mine';

interface PersonalTab {
  icon: string;
  iconActive?: string;
  key: PersonalTabKey;
  route: string;
  translationKey: string;
}

const personalTabs: readonly PersonalTab[] = [
  {
    icon: 'detail',
    iconActive: 'detail-fill',
    key: 'detail',
    route: ROUTES_PATH.DETAIL.getPath(),
    translationKey: 'tabBar.detail',
  },
  {
    icon: 'chart',
    iconActive: 'chart-fill',
    key: 'chart',
    route: ROUTES_PATH.CHART.getPath(),
    translationKey: 'tabBar.chart',
  },
  {
    icon: 'add',
    key: 'bookkeeping',
    route: ROUTES_PATH.BOOKKEEPING.getPath(),
    translationKey: 'tabBar.bookkeeping',
  },
  {
    icon: 'community',
    iconActive: 'community-fill',
    key: 'discovery',
    route: ROUTES_PATH.DISCOVERY.getPath(),
    translationKey: 'tabBar.discovery',
  },
  {
    icon: 'mine',
    iconActive: 'mine-fill',
    key: 'mine',
    route: ROUTES_PATH.MINE.getPath(),
    translationKey: 'tabBar.mine',
  },
];

export interface TabBarProps {
  activeKey?: PersonalTabKey;
  active?: number;
}

export const TabBar: FC<TabBarProps> = ({ active, activeKey }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const resolvedActiveKey = activeKey ?? personalTabs[active ?? 0]?.key ?? 'detail';

  const handleTabClick = (tab: PersonalTab) => {
    if (tab.key === resolvedActiveKey)
      return;
    playSound.turnPage();
    navigate(tab.route);
  };

  return (
    <BottomTabBarPresentation
      activeKey={resolvedActiveKey}
      ariaLabel={t('tabBar.navigation')}
      items={personalTabs.map(tab => ({
        activeIcon: tab.key === 'bookkeeping'
          ? <AddOutline className="text-2xl" />
          : <Icon name={tab.iconActive ?? tab.icon} />,
        icon: tab.key === 'bookkeeping'
          ? <AddOutline className="text-2xl" />
          : <Icon name={tab.icon} />,
        key: tab.key,
        label: t(tab.translationKey),
        onPrefetch: () => prefetchRoute(`personal-${tab.key}`),
        onSelect: () => handleTabClick(tab),
        prominent: tab.key === 'bookkeeping',
        route: tab.route,
      }))}
    />
  );
};
