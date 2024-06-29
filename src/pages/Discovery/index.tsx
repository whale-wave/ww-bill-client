import React, { useEffect } from 'react';
import { NavBar } from 'bw-mobile';
import { CurrentMonthBillCard, TabBar } from '@/components';
import { useUserStore } from '@/store';
import { CommonFunctionCard } from '@/pages/Discovery/components';
import { useGetUserUserInfoQuery } from '@/hooks';

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
        <CommonFunctionCard />
        {/* <div className={classNames('flex flex-col h-[140px] mt-[12px] pt-[12px] px-[16px] pb-[10px] bg-[#fff] rounded-[5px]')}> */}
        {/*  <div */}
        {/*    className={classNames( */}
        {/*      'flex items-center font-bold justify-between text-[17px] text-[#333233]', */}
        {/*    )} */}
        {/*  > */}
        {/*    08月总预算 */}
        {/*    <p className="ml-auto mr-[9px] text-[12px] text-[#999]">查看全部</p> */}
        {/*    <Icon name="right" style={{ fontSize: 12 }} /> */}
        {/*  </div> */}
        {/*  <div className="flex grow"> */}
        {/*    <div */}
        {/*      className="flex justify-center items-center h-full" */}
        {/*      style={{ width: '40%', transform: 'translate(-16px)' }} */}
        {/*    > */}
        {/*      <p>剩余</p> */}
        {/*      <p>76%</p> */}
        {/*    </div> */}
        {/*    <div */}
        {/*      className="grow flex flex-col h-full justify-end" */}
        {/*      style={{ color: '#6c6c6c' }} */}
        {/*    > */}
        {/*      <div */}
        {/*        className="flex items-center justify-between" */}
        {/*        style={{ */}
        {/*          color: '#333233', */}
        {/*          fontSize: 14, */}
        {/*          borderBottom: '1px solid #ebebeb', */}
        {/*        }} */}
        {/*      > */}
        {/*        <span>剩余预算</span> */}
        {/*        <span style={{ fontSize: 18 }}>6078.94</span> */}
        {/*      </div> */}
        {/*      <div className="flex items-center justify-between"> */}
        {/*        <span style={{ fontSize: 12 }}>本月预算</span> */}
        {/*        <span style={{ fontSize: 16 }}>8000.00</span> */}
        {/*      </div> */}
        {/*      <div className="flex items-center justify-between"> */}
        {/*        <span style={{ fontSize: 12 }}>本月支出</span> */}
        {/*        <span style={{ fontSize: 16 }}>1921.06</span> */}
        {/*      </div> */}
        {/*    </div> */}
        {/*  </div> */}
        {/* </div> */}
      </div>
      <TabBar active={3} />
    </div>
  );
};

export default Discovery;
