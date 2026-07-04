import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserUserInfoQuery, usePostCheckInMutation } from '@/entities/user';
import { BottomList } from '@/pages/mine/components';
import UserInfo from '@/pages/mine/UserInfo';
import { playSound } from '@/shared/lib/play-sound';
import { Icon } from '@/shared/ui';
import { TabBar } from '@/widgets/layout';
import styles from './index.module.scss';

const Mine: FC = () => {
  const navigate = useNavigate();

  const { data: userInfo } = useGetUserUserInfoQuery();
  const [postCheckInMutate] = usePostCheckInMutation();

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

  const onCheckIn = useCallback(async () => {
    if (checkIn)
      return;
    await postCheckInMutate();
  }, [checkIn, postCheckInMutate]);

  const tabs = useMemo(() => [
    {
      icon: 'msg',
      name: '消息',
      path: '/message',
      onClick() {
        playSound.turnPage();
        navigate(this.path);
      },
    },
    {
      icon: 'badge',
      name: '我的徽章',
      onClick() {
        Toast.show({
          content: '敬请期待',
        });
      },
    },
    {
      icon: 'integral',
      name: '我的积分',
      onClick() {
        Toast.show({
          content: '敬请期待',
        });
      },
    },
    {
      icon: 'invite',
      name: '邀请好友',
      onClick() {
        Toast.show({
          content: '敬请期待',
        });
      },
    },
    {
      icon: 'setting',
      name: '设置',
      path: '/settings',
      onClick() {
        playSound.turnPage();
        navigate(this.path);
      },
    },
  ], []);

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
                onClick={tab.onClick.bind(tab)}
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
