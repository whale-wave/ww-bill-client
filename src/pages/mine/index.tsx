import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'bw-mobile';
import styles from './index.module.scss';
import { playSound } from '@/modules';
import { spliceNumberByPoint, zeroFill } from '@/utils/time';
import { checkInPost } from '@/api';
import { TabBar } from '@/components';
import UserInfo from '@/pages/mine/UserInfo';
import { useUserStore } from '@/store';
import { useGetUserUserInfoQuery } from '@/hooks';

const Mine: FC = () => {
  const navigate = useNavigate();

  const { setUserInfo, token } = useUserStore(
    ({ setUserInfo, token }) => ({
      setUserInfo,
      token,
    }),
  );

  const { data: userInfo } = useGetUserUserInfoQuery({
    options: {
      enabled: !!token,
    },
  });

  const checkIn = useMemo(() => {
    return !!userInfo?.checkIn;
  }, [userInfo]);

  const numberInfo = useMemo(() => {
    const defaultNumberInfo = {
      checkInAll: 0,
      checkInKeep: 0,
      recordCount: 0,
    };

    if (!userInfo)
      return defaultNumberInfo;

    const { checkInAll, checkInKeep, recordCount } = userInfo;

    return {
      checkInAll,
      checkInKeep,
      recordCount,
    };
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo)
      return;
    setUserInfo(userInfo);
  }, [userInfo]);

  const onCheckIn = async () => {
    if (checkIn)
      return;
    await checkInPost();
  };

  const tabs = [
    {
      icon: 'msg',
      name: '消息',
      path: '/message',
    },
    {
      icon: 'badge',
      name: '我的徽章',
    },
    {
      icon: 'integral',
      name: '我的积分',
    },
    {
      icon: 'invite',
      name: '邀请好友',
    },
    {
      icon: 'setting',
      name: '设置',
      path: '/settings',
    },
  ];

  const goTo = (path?: string) => {
    playSound.turnPage();
    path && navigate(path);
  };

  return (
    <div className={classNames('page', styles.wrapper)}>
      <main className="overflow-auto flex flex-col grow">
        <UserInfo
          name={userInfo?.name}
          avatar={userInfo?.avatar}
          checkIn={checkIn}
          numberInfo={numberInfo}
          onCheckIn={onCheckIn}
        />

        <div className={styles.box}>
          <div className={classNames(styles.menu, 'flex')}>
            {tabs.map(tab => (
              <div
                key={tab.name}
                className={classNames(
                  styles.tab,
                  'w-1/4 flex flex-col justify-center items-center',
                )}
                onClick={() => goTo(tab.path)}
              >
                <Icon name={tab.icon} className={styles.icon} />
                <span className={styles.name}>{tab.name}</span>
              </div>
            ))}
          </div>
          <div className={classNames(styles.bill, 'flex flex-col')}>
            <div
              className={classNames(
                styles.hd,
                'flex items-center font-bold justify-between',
              )}
            >
              账单
              <Icon name="right" style={{ fontSize: 12 }} />
            </div>
            <div
              className={classNames(styles.bottom, 'flex grow items-end')}
              onClick={() => goTo('/bill')}
            >
              <div className={classNames(styles.big, 'flex-shrink-0 relative')}>
                {zeroFill(userInfo?.billRecord?.month)}
                <span>月</span>
              </div>
              <div className={classNames('flex flex-grow')}>
                <div className="grow w-1/3">
                  <div className={classNames(styles.name)}>收入</div>
                  <div className={classNames(styles.money)}>
                    {spliceNumberByPoint(userInfo?.billRecord?.income)[0]}
                    .
                    {spliceNumberByPoint(userInfo?.billRecord?.income)[1]}
                  </div>
                </div>
                <div className="grow w-1/3">
                  <div className={classNames(styles.name)}>支出</div>
                  <div className={classNames(styles.money)}>
                    {spliceNumberByPoint(userInfo?.billRecord?.expend)[0]}
                    .
                    {spliceNumberByPoint(userInfo?.billRecord?.expend)[1]}
                  </div>
                </div>
                <div className="grow w-1/3">
                  <div className={classNames(styles.name)}>结余</div>
                  <div className={classNames(styles.money)}>
                    {spliceNumberByPoint(userInfo?.billRecord?.surplus)[0]}
                    .
                    {spliceNumberByPoint(userInfo?.billRecord?.surplus)[1]}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className={classNames(styles.budget, 'flex flex-col')}> */}
          {/*  <div */}
          {/*    className={classNames( */}
          {/*      styles.hd, */}
          {/*      'flex items-center font-bold justify-between', */}
          {/*    )} */}
          {/*  > */}
          {/*    08月总预算 */}
          {/*    <p className="ml-auto">查看全部</p> */}
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
          <div
            className={classNames(
              styles.setting,
              'flex items-center justify-between font-bold',
            )}
            onClick={() => goTo('/settings')}
          >
            设置
            <Icon name="right" style={{ fontSize: 12 }} />
          </div>
        </div>
      </main>
      <TabBar active={4} />
    </div>
  );
};

export default Mine;
