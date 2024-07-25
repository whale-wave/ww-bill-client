import { useNavigate } from 'react-router-dom';
import { AddOutline } from 'antd-mobile-icons';
import type { FC } from 'react';
import classNames from 'classnames';
import { playSound } from '@/modules';
import './tab-bar.scss';
import { Icon } from '@/components';

interface TabBarProps {
  active: number;
}

export const TabBar: FC<TabBarProps> = ({ active }) => {
  const navigate = useNavigate();

  const tabBarList = [
    {
      name: '明细',
      icon: 'detail',
      iconActive: 'detail-fill',
      router: '/detail',
    },
    {
      name: '图表',
      icon: 'chart',
      iconActive: 'chart-fill',
      router: '/chart',
    },
    {
      name: '记账',
      icon: 'add',
      router: '/bookkeeping',
      customRender: (tab: any) => {
        return (
          <div className="flex justify-center items-center flex-col relative">
            <div className="border-[1px] border-[#f7f7f7] border-solid p-[5px] rounded-full border-r-0 border-b-0 border-l-0 absolute bottom-[50%] bg-[#fff]">
              <div className="bg-primary rounded-full w-[55px] h-[55px] flex justify-center items-center">
                <AddOutline className="text-[30px]" />
              </div>
            </div>
            <AddOutline className="tab-icon opacity-0" />
            <span className="name">{tab.name}</span>
          </div>
        );
      },
    },
    {
      name: '发现',
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
      name: '我的',
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

  return (
    <div className="h-[60px] flex-shrink-0 z-[100]">
      <div className={classNames('bwm-tab-bar fixed bottom-0')}>
        {tabBarList.map((tab, index) => (
          <div
            key={tab.name}
            className="item relative"
            onClick={() => changeRoute(index, tab.router)}
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
