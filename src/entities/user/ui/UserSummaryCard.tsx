import type { FC } from 'react';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, GradientPanel, MetricGrid } from '@/shared/ui';

export interface UserSummaryCardProps {
  avatar?: string;
  name?: string;
  checkIn: boolean;
  numberInfo: {
    checkInAll: number;
    checkInKeep: number;
    recordCount: number;
  };
  onCheckIn: () => void;
  onProfileClick: () => void;
}

export const UserSummaryCard: FC<UserSummaryCardProps> = ({
  name,
  avatar,
  checkIn,
  onCheckIn,
  numberInfo,
  onProfileClick,
}) => {
  const { t } = useTranslation('user');

  return (
    <div className="space-y-[14px]">
      <GradientPanel className="overflow-hidden bg-[linear-gradient(155.269deg,#c6e8f8_6.1733%,#ddf2fc_41.235%,#f4e0f4_93.827%)] px-[22px] py-6 shadow-[0_6px_12px_rgba(60,140,180,0.16)]" elevation="none" surface="aurora">
        <div className="flex items-center gap-4">
          <button
            className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[linear-gradient(145deg,#8fc7e8_0%,#e9a5c4_100%)] shadow-ww-xs"
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
            <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#f0a0b8]">
              <DesignIcon name="avatar-edit" size={11} />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[20px] font-extrabold leading-[30px] text-ww-ink">{name || t('notLoggedIn')}</div>
            {name && (
              <button
                className="mt-2 flex h-7 items-center rounded-[9px] bg-[linear-gradient(157.319deg,#6fc2dc_0%,#4aaac4_100%)] px-[13px] py-[5px] text-[12px] font-bold leading-[18px] text-white shadow-[0_4px_6px_rgba(74,170,200,0.36)] disabled:opacity-55"
                disabled={checkIn}
                onClick={onCheckIn}
                type="button"
              >
                <DesignIcon className="mr-1" name="check-in" size={12} />
                {checkIn ? t('checkIn.alreadyCheckedIn') : t('checkIn.button')}
              </button>
            )}
          </div>
        </div>
        <MetricGrid
          className="mt-[22px] rounded-[14px] border border-border-primary bg-[rgba(240,248,255,0.8)] px-2 py-[14px]"
          density="hero"
          items={[
            { key: 'keep', label: t('checkIn.keep'), suffix: t('checkIn.dayUnit'), tone: 'primary', value: numberInfo.checkInKeep },
            { key: 'all', label: t('checkIn.allDays'), suffix: t('checkIn.dayUnit'), value: numberInfo.checkInAll },
            { key: 'records', label: t('checkIn.recordCount'), suffix: t('checkIn.recordUnit'), tone: 'expense', value: numberInfo.recordCount },
          ]}
        />
      </GradientPanel>
      <GradientPanel className="flex min-h-12 items-center gap-[10px] px-[18px] py-[13px]" elevation="low" surface="vip">
        <DesignIcon name="vip-crown" size={18} />
        <span className="flex-1 text-[13px] font-semibold leading-[19.5px] text-ww-mid">{t('vipNotSupported')}</span>
        <DesignIcon name="list-chevron" size={16} />
      </GradientPanel>
    </div>
  );
};
