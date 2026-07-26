import type { FC } from 'react';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound, prefetchRoute } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import './tab-bar.scss';

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
    <div className="h-[60px] flex-shrink-0 z-[100]">
      <div aria-label={t('tabBar.navigation')} className="bwm-tab-bar fixed bottom-0">
        {personalTabs.map(tab => (
          <div
            className="item relative"
            data-route={tab.route}
            data-tab-key={tab.key}
            key={tab.key}
            onClick={() => handleTabClick(tab)}
            onMouseEnter={() => prefetchRoute(`personal-${tab.key}`)}
            onTouchStart={() => prefetchRoute(`personal-${tab.key}`)}
          >
            {tab.key === 'bookkeeping'
              ? (
                  <div className="flex justify-center items-center flex-col relative">
                    <div className="border-[1px] border-[#f7f7f7] border-solid p-[5px] rounded-full border-r-0 border-b-0 border-l-0 absolute bottom-[50%] bg-[#fff]">
                      <div className="bg-primary rounded-full w-[55px] h-[55px] flex justify-center items-center">
                        <AddOutline className="text-2xl" />
                      </div>
                    </div>
                    <AddOutline className="tab-icon opacity-0" />
                    <span className="name">{t(tab.translationKey)}</span>
                  </div>
                )
              : (
                  <>
                    <Icon
                      className="tab-icon"
                      name={tab.key === resolvedActiveKey ? tab.iconActive ?? tab.icon : tab.icon}
                    />
                    <span className="name">{t(tab.translationKey)}</span>
                  </>
                )}
          </div>
        ))}
      </div>
    </div>
  );
};
