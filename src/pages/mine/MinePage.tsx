import type { FC } from 'react';
import type { DesignIconName } from '@/shared/ui';
import { Toast } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserUserInfoQuery, usePostCheckInMutation, UserSummaryCard } from '@/entities/user';
import { BottomList } from '@/pages/mine/ui';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { ActionMenuCard, DesignIcon } from '@/shared/ui';
import { TabBar } from '@/widgets/layout';

const Mine: FC = () => {
  const { t } = useTranslation('user');
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
      icon: 'mine-message' as DesignIconName,
      name: t('tabs.message'),
      path: '/message',
      onClick() {
        playSound.turnPage();
        navigate(this.path);
      },
    },
    {
      icon: 'mine-badge' as DesignIconName,
      name: t('tabs.myBadges'),
      onClick() {
        Toast.show({
          content: t('tabs.comingSoon'),
        });
      },
    },
    {
      icon: 'mine-points' as DesignIconName,
      name: t('tabs.myPoints'),
      onClick() {
        Toast.show({
          content: t('tabs.comingSoon'),
        });
      },
    },
    {
      icon: 'mine-invite' as DesignIconName,
      name: t('tabs.inviteFriends'),
      onClick() {
        Toast.show({
          content: t('tabs.comingSoon'),
        });
      },
    },
    {
      icon: 'mine-settings' as DesignIconName,
      name: t('tabs.settings'),
      path: '/settings',
      onClick() {
        playSound.turnPage();
        navigate(this.path);
      },
    },
  ], [navigate, t]);

  return (
    <div className="page">
      <main className="ww-tab-bar-scroll-padding grow overflow-auto px-[18px] pt-[max(0px,env(safe-area-inset-top))]">
        <UserSummaryCard
          name={userInfo?.name}
          avatar={userInfo?.avatar}
          checkIn={checkIn}
          numberInfo={numberInfo}
          onCheckIn={onCheckIn}
          onProfileClick={() => navigate('/user-info')}
        />

        <div className="mt-[14px] space-y-[14px]">
          <ActionMenuCard
            columns={5}
            items={tabs.map((tab, index) => ({
              icon: <DesignIcon name={tab.icon} size={16} />,
              key: tab.name,
              label: tab.name,
              onClick: tab.onClick.bind(tab),
              tone: index === 1 ? 'pink' : index === 2 ? 'amber' : index === 3 ? 'green' : index === 4 ? 'purple' : 'blue',
            }))}
            variant="mine-actions"
          />
          <BottomList />
        </div>
      </main>
      <TabBar active={4} />
    </div>
  );
};

export default Mine;
