import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'bw-mobile';
import styles from './index.module.scss';
import { playSound } from '@/modules';
import { checkInPost } from '@/api';
import { TabBar } from '@/components';
import UserInfo from '@/pages/mine/UserInfo';
import { useUserStore } from '@/store';
import { useGetUserUserInfoQuery } from '@/hooks';
import { BottomList } from '@/pages/mine/components';

const Mine: FC = () => {
  const navigate = useNavigate();

  const userInfo = useUserStore(({ userInfo }) => userInfo);
  const token = useUserStore(({ token }) => token);
  const setUserInfo = useUserStore(({ setUserInfo }) => setUserInfo);

  const { data: userInfoData } = useGetUserUserInfoQuery({
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
    if (!userInfoData)
      return;
    setUserInfo(userInfoData);
  }, [userInfoData]);

  const onCheckIn = useCallback(async () => {
    if (checkIn)
      return;
    await checkInPost();
  }, [checkIn]);

  const tabs = useMemo(() => [
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
  ], []);

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
          <div className={classNames(styles.menu, 'flex mb-3')}>
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
          <BottomList />
        </div>
      </main>
      <TabBar active={4} />
    </div>
  );
};

export default Mine;
