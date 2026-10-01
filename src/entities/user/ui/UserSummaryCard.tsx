import type { FC } from 'react';
import { ProfileAvatarVisual, ProfileCheckInVisual, ProfileSummaryVisual, ProfileTitleContent } from '@ww-bill/bill-ui';
import { CalendarCheck2, Medal } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, MetricGrid, Surface, UserAvatar } from '@/shared/ui';

export interface UserSummaryCardProps {
  achievementTitle?: string | null;
  avatar?: string | null;
  name?: string;
  checkIn: boolean;
  isCheckingIn?: boolean;
  numberInfo: {
    checkInAll?: number | null;
    checkInKeep?: number | null;
    recordCount?: number | null;
  };
  onProfileClick: () => void;
  onCheckIn?: () => void;
}

export const UserSummaryCard: FC<UserSummaryCardProps> = ({
  name,
  avatar,
  achievementTitle,
  checkIn,
  isCheckingIn = false,
  numberInfo,
  onProfileClick,
  onCheckIn,
}) => {
  const { t } = useTranslation('user');

  return (
    <div className="space-y-[14px]">
      <Surface className="ww-user-summary-card overflow-hidden px-5 py-5" material="raised">
        <ProfileSummaryVisual
          avatar={<ProfileAvatarVisual label={name || t('notLoggedIn')} onClick={onProfileClick} avatar={<UserAvatar alt={name || t('notLoggedIn')} fallback="icon" name={name} size={62} src={avatar} />} badge={<DesignIcon name="avatar-edit" size={11} />} />}
          name={name || t('notLoggedIn')}
          title={<ProfileTitleContent icon={<Medal className="shrink-0" size={12} strokeWidth={2} />} label={achievementTitle ?? '航程称号 · 开启你的航程'} />}
          action={name !== undefined
            ? (checkIn
                ? <ProfileCheckInVisual icon={<CalendarCheck2 size={14} strokeWidth={2} />}>{t('checkIn.completed')}</ProfileCheckInVisual>
                : onCheckIn
                  ? <ProfileCheckInVisual primitive="button" interactive disabled={isCheckingIn} busy={isCheckingIn} onClick={onCheckIn} icon={<CalendarCheck2 size={14} strokeWidth={2} />}>{t(isCheckingIn ? 'checkIn.checking' : 'checkIn.action')}</ProfileCheckInVisual>
                  : <span />)
            : undefined}
          metrics={(
            <MetricGrid

              density="hero"
              items={[
                { key: 'keep', label: t('checkIn.keep'), suffix: t('checkIn.dayUnit'), tone: 'primary', value: numberInfo.checkInKeep ?? 0 },
                { key: 'all', label: t('checkIn.allDays'), suffix: t('checkIn.dayUnit'), value: numberInfo.checkInAll ?? 0 },
                {
                  key: 'records',
                  label: t('checkIn.recordCount'),
                  suffix: t('checkIn.recordUnit'),
                  tone: 'expense',
                  value: numberInfo.recordCount ?? 0,
                  valueClassName: 'bill-profile-summary__record-count',
                },
              ]}
            />
          )}
        />
      </Surface>
      {/* <Surface className="flex min-h-12 items-center gap-[10px] px-[18px] py-[13px]" material="content">
        <DesignIcon name="vip-crown" size={18} />
        <span className="flex-1 text-[13px] font-semibold leading-[19.5px] text-ww-mid">{t('vipNotSupported')}</span>
        <DesignIcon name="list-chevron" size={16} />
      </Surface> */}
    </div>
  );
};
