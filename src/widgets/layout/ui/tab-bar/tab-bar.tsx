import type { MotionValue } from 'motion/react';
import type { FC } from 'react';
import type { PersonalTab, PersonalTabKey } from '../../model/personal-tabs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import { BottomTabBarPresentation, DesignIcon } from '@/shared/ui';
import { PERSONAL_TABS } from '../../model/personal-tabs';
import { useHasPersonalTabBarOwner } from './personal-tab-bar-context';

export type { PersonalTabKey } from '../../model/personal-tabs';

export interface TabBarProps {
  activeKey?: PersonalTabKey;
  active?: number;
  indicatorProgress?: MotionValue<number>;
  indicatorStretch?: MotionValue<number>;
}

export const TabBar: FC<TabBarProps> = ({ active, activeKey, indicatorProgress, indicatorStretch }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const hasLayoutOwner = useHasPersonalTabBarOwner();
  const resolvedActiveKey = activeKey ?? PERSONAL_TABS[active ?? 0]?.key ?? 'detail';

  const handleTabClick = (tab: PersonalTab) => {
    if (tab.key === resolvedActiveKey)
      return;
    playSound.turnPage();
    navigate(tab.route);
  };

  if (hasLayoutOwner)
    return null;

  return (
    <BottomTabBarPresentation
      activeKey={resolvedActiveKey}
      ariaLabel={t('tabBar.navigation')}
      indicatorProgress={indicatorProgress}
      indicatorStretch={indicatorStretch}
      items={PERSONAL_TABS.map(tab => ({
        activeIcon: <DesignIcon name={tab.iconActive ?? tab.icon} size={tab.key === 'bookkeeping' ? 22 : 19} />,
        icon: <DesignIcon name={tab.icon} size={tab.key === 'bookkeeping' ? 22 : 19} />,
        key: tab.key,
        label: t(tab.translationKey),
        onPrefetch: () => prefetchRoute(`personal-${tab.key}`),
        onSelect: () => handleTabClick(tab),
        prominent: tab.prominent,
        route: tab.route,
      }))}
    />
  );
};
