import type { FC } from 'react';
import type { DesignIconName } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import { BottomTabBarPresentation, DesignIcon } from '@/shared/ui';

export type PersonalTabKey
  = | 'detail'
    | 'chart'
    | 'bookkeeping'
    | 'discovery'
    | 'mine';

interface PersonalTab {
  icon: DesignIconName;
  iconActive?: DesignIconName;
  key: PersonalTabKey;
  route: string;
  translationKey: string;
}

const personalTabs: readonly PersonalTab[] = [
  {
    icon: 'tab-detail',
    iconActive: 'tab-detail-active',
    key: 'detail',
    route: ROUTES_PATH.DETAIL.getPath(),
    translationKey: 'tabBar.detail',
  },
  {
    icon: 'tab-chart',
    iconActive: 'tab-chart-active',
    key: 'chart',
    route: ROUTES_PATH.CHART.getPath(),
    translationKey: 'tabBar.chart',
  },
  {
    icon: 'tab-add',
    key: 'bookkeeping',
    route: ROUTES_PATH.BOOKKEEPING.getPath(),
    translationKey: 'tabBar.bookkeeping',
  },
  {
    icon: 'tab-discovery',
    iconActive: 'tab-discovery-active',
    key: 'discovery',
    route: ROUTES_PATH.DISCOVERY.getPath(),
    translationKey: 'tabBar.discovery',
  },
  {
    icon: 'tab-mine',
    iconActive: 'tab-mine-active',
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
        activeIcon: <DesignIcon name={tab.iconActive ?? tab.icon} size={tab.key === 'bookkeeping' ? 22 : 19} />,
        icon: <DesignIcon name={tab.icon} size={tab.key === 'bookkeeping' ? 22 : 19} />,
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
