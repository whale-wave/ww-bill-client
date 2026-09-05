import type { FC } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, MetricGrid, Surface } from '@/shared/ui';

export interface UserSummaryCardProps {
  avatar?: string;
  name?: string;
  checkIn: boolean;
  isCheckInPending?: boolean;
  numberInfo: {
    checkInAll?: number | null;
    checkInKeep?: number | null;
    recordCount?: number | null;
  };
  onCheckIn: () => void;
  onProfileClick: () => void;
}

export const UserSummaryCard: FC<UserSummaryCardProps> = ({
  name,
  avatar,
  checkIn,
  isCheckInPending = false,
  onCheckIn,
  numberInfo,
  onProfileClick,
}) => {
  const { t } = useTranslation('user');

  return (
    <div className="space-y-[14px]">
      <Surface className="ww-user-summary-card overflow-hidden px-5 py-5" material="raised">
        <div className="flex items-center gap-4">
          <button
            className="ww-user-summary-avatar relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-[3px] border-white shadow-ww-xs"
            onClick={onProfileClick}
            type="button"
          >
            {avatar
              ? (
                  <img
                    alt={name || t('notLoggedIn')}
                    className="h-full w-full rounded-full object-cover"
                    src={avatar}
                  />
                )
              : <DesignIcon name="avatar-user" size={32} />}
            <span className="ww-user-summary-edit absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
              <DesignIcon name="avatar-edit" size={11} />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[20px] font-extrabold leading-[30px] text-ww-ink">{name || t('notLoggedIn')}</div>
            {name && (
              <button
                className="mt-2 flex h-11 items-center border-0 bg-transparent p-0 text-[12px] font-bold leading-[18px] transition-opacity active:opacity-75 disabled:opacity-55"
                disabled={checkIn || isCheckInPending}
                onClick={onCheckIn}
                type="button"
              >
                <span className="ww-profile-check-in flex items-center px-[13px]">
                  <CalendarCheck2 className="mr-1" size={14} strokeWidth={2} />
                  {checkIn ? t('checkIn.alreadyCheckedIn') : t('checkIn.button')}
                </span>
              </button>
            )}
          </div>
        </div>
        <MetricGrid
          className="ww-user-summary-metrics mt-[18px] border-0 border-t border-solid border-border-primary px-1 pt-3"
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
              valueClassName: 'whitespace-nowrap text-[clamp(14px,5vw,20px)] tracking-[-0.04em]',
            },
          ]}
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
