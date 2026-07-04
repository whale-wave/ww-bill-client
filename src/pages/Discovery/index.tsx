import React, { useEffect } from 'react';
import { CurrentMonthBillCard, TabBar } from '@/components';
import { CurMonthBudgetCard } from '@/entities/budget';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { useUserStore } from '@/features/auth';
import { AssetManagerCard, CommonFunctionCard } from '@/pages/Discovery/components';
import { NavBar } from '@/shared/ui';

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
      <div className="flex-grow pb-[80px] relative overflow-auto">
        <div className="overflow-hidden h-[40px] absolute w-full">
          <div className="absolute w-[140%] h-[40px] bg-primary left-[-20%] top-0 rounded-b-[50%] -z-[1]"></div>
        </div>
        <div className="px-4 space-y-[12px] ">
          <CurrentMonthBillCard billRecord={userInfo?.billRecord} />
          <CurMonthBudgetCard />
          <AssetManagerCard />
          <CommonFunctionCard />
        </div>
      </div>
      <TabBar active={3} />
    </div>
  );
};

export default Discovery;
