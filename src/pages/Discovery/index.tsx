import React, { useEffect } from 'react';
import { NavBar } from 'bw-mobile';
import { CurrentMonthBillCard, TabBar } from '@/components';
import { useUserStore } from '@/store';
import { AssetManagerCard, CommonFunctionCard } from '@/pages/Discovery/components';
import { useGetUserUserInfoQuery } from '@/hooks';
import CurMonthBudgetCard from '@/components/CurMonthBudgetCard/CurMonthBudgetCard.tsx';

interface DiscoveryProps {
}

const Discovery: React.FC<DiscoveryProps> = () => {
  const userInfo = useUserStore(({ userInfo }) => userInfo);
  const setUserInfo = useUserStore(({ setUserInfo }) => setUserInfo);
  const { data } = useGetUserUserInfoQuery();

  useEffect(() => {
    if (!data)
      return;

    setUserInfo(data);
  }, [data]);

  return (
    <div className="page-new bg-bg-gray fixed top-0 left-0 w-full">
      <NavBar backArrow={false}>发现</NavBar>
      <div className="flex-grow px-4 space-y-[12px] pb-[12px] relative">
        <div className="absolute w-[140%] h-[40px] bg-primary left-[-20%] top-0 rounded-b-[50%] -z-[1]"></div>
        <CurrentMonthBillCard billRecord={userInfo?.billRecord} />
        <CurMonthBudgetCard />
        <AssetManagerCard />
        <CommonFunctionCard />
      </div>
      <TabBar active={3} />
    </div>
  );
};

export default Discovery;
