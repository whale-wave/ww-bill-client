import type { FC } from 'react';
import { ProfileSummaryVisual } from '@ww-bill/bill-ui';
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
          avatar={(
            <button
              className="ww-user-summary-avatar relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-[3px] border-white shadow-ww-xs"
              onClick={onProfileClick}
              type="button"
            >
              <UserAvatar alt={name || t('notLoggedIn')} fallback="icon" name={name} size={68} src={avatar} />
              <span className="ww-user-summary-edit absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
                <DesignIcon name="avatar-edit" size={11} />
              </span>
            </button>
          )}
          name={name || t('notLoggedIn')}
          title={(
            <>
              <Medal className="shrink-0" size={12} strokeWidth={2} />
              <span className="truncate">{achievementTitle ?? '航程称号 · 开启你的航程'}</span>

            </>
          )}
          action={name !== undefined
            ? (
                checkIn
                  ? (
                      <span className="ww-profile-check-in flex items-center px-[13px]">
                        <CalendarCheck2 className="mr-1" size={14} strokeWidth={2} />
                        {t('checkIn.completed')}
                      </span>
                    )
                  : onCheckIn
                    ? (
                        <button
                          className="ww-profile-check-in flex min-h-11 items-center px-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-busy={isCheckingIn}
                          disabled={isCheckingIn}
                          onClick={onCheckIn}
                          type="button"
                        >
                          <CalendarCheck2 className="mr-1" size={14} strokeWidth={2} />
                          {t(isCheckingIn ? 'checkIn.checking' : 'checkIn.action')}
                        </button>
                      )
                    : <span />
              )
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
