import type { FC } from 'react';
import { AddOutline } from 'antd-mobile-icons';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { Icon } from '@/shared/ui';
import './tab-bar.scss';

/** Preload route chunks on hover/touch for instant-feel navigation. */
const routePrefetch: Record<string, () => Promise<unknown>> = {
  '/detail': () => import('@/pages/record/detail/DetailPage'),
  '/chart': () => import('@/pages/chart/chart-home/ChartHomePage'),
  '/bookkeeping': () => import('@/pages/record/bookkeeping/BookkeepingPage'),
  '/discovery': () => import('@/pages/discovery/DiscoveryPage'),
  '/mine': () => import('@/pages/mine/MinePage'),
};

function prefetchRoute(path: string): void {
  routePrefetch[path]?.().catch(() => {});
}

interface TabBarProps {
  active: number;
}

export const TabBar: FC<TabBarProps> = ({ active }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const tabBarList = [
    {
      name: t('tabBar.detail'),
      icon: 'detail',
      iconActive: 'detail-fill',
      router: '/detail',
    },
    {
      name: t('tabBar.chart'),
      icon: 'chart',
      iconActive: 'chart-fill',
      router: '/chart',
    },
    {
      name: t('tabBar.bookkeeping'),
      icon: 'add',
      router: '/bookkeeping',
      customRender: (tab: any) => {
        return (
          <div className="flex justify-center items-center flex-col relative">
            <div className="border-[1px] border-[#f7f7f7] border-solid p-[5px] rounded-full border-r-0 border-b-0 border-l-0 absolute bottom-[50%] bg-[#fff]">
              <div className="bg-primary rounded-full w-[55px] h-[55px] flex justify-center items-center">
                <AddOutline className="text-2xl" />
              </div>
            </div>
            <AddOutline className="tab-icon opacity-0" />
            <span className="name">{tab.name}</span>
          </div>
        );
      },
    },
    {
      name: t('tabBar.discovery'),
      icon: 'community',
      iconActive: 'community-fill',
      router: '/discovery',
    },
    // {
    //   name: '社区',
    //   icon: 'community',
    //   iconActive: 'community-fill',
    //   router: '/community',
    // },
    {
      name: t('tabBar.mine'),
      icon: 'mine',
      iconActive: 'mine-fill',
      router: '/mine',
    },
  ];

  const isActive = (tab: any, index: number) => {
    return index === active ? tab.iconActive : tab.icon;
  };

  const changeRoute = (index: number, router: string) => {
    if (index === active)
      return;
    playSound.turnPage();
    navigate(router);
  };

  const handleTabBarClick = useCallback((index: number, item: any) => () => {
    if (item.onClick) {
      item.onClick();
    }
    else {
      changeRoute(index, item.router);
    }
  }, []);

  return (
    <div className="h-[60px] flex-shrink-0 z-[100]">
      <div className={classNames('bwm-tab-bar fixed bottom-0')}>
        {tabBarList.map((tab, index) => (
          <div
            key={tab.name}
            className="item relative"
            onClick={handleTabBarClick(index, tab)}
            onMouseEnter={() => prefetchRoute(tab.router)}
            onTouchStart={() => prefetchRoute(tab.router)}
          >
            {tab.customRender
              ? tab.customRender(tab)
              : (
                  <>
                    <Icon name={isActive(tab, index)} className="tab-icon" />
                    <span className="name">{tab.name}</span>
                  </>
                )}
          </div>
        ))}
      </div>
    </div>
  );
};
