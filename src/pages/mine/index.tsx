import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
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
