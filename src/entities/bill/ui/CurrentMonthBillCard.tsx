import type { FC } from 'react';
import type { MetricGridItem } from '@/shared/ui';
import { useTranslation } from '@/shared/i18n';
import { zeroFill } from '@/shared/lib/time';
import { GradientPanel, Icon, MetricGrid } from '@/shared/ui';

export interface CurrentMonthBillCardProps {
  billRecord?: {
    month: number;
    income: number;
    expend: number;
    surplus: number;
  };
  onClick?: () => void;
}

export const CurrentMonthBillCard: FC<CurrentMonthBillCardProps> = ({ billRecord, onClick }) => {
  const { t } = useTranslation(['bill', 'common']);
  const items: MetricGridItem[] = [
    { key: 'income', label: t('bill:monthCard.income'), tone: 'income', value: billRecord?.income ?? '0.00' },
    { key: 'expend', label: t('bill:monthCard.expend'), tone: 'expense', value: billRecord?.expend ?? '0.00' },
    { key: 'surplus', label: t('bill:monthCard.surplus'), tone: 'primary', value: billRecord?.surplus ?? '0.00' },
  ];

  return (
    <GradientPanel
      as="article"
      className="cursor-pointer overflow-hidden px-5 py-[18px]"
      data-testid="current-month-bill-card"
      elevation="high"
      onClick={onClick}
      surface="ice"
    >
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/70 text-primary-deep">
          <Icon className="text-[18px]" name="bill" />
        </span>
        <div>
          <div className="text-[14px] font-bold leading-[21px] text-ww-ink">{t('bill:monthCard.title')}</div>
          <div className="font-number text-[11px] font-normal leading-[16.5px] text-ww-mid">
            {zeroFill(billRecord?.month)}
            {t('common:dateTime.monthSuffix')}
          </div>
        </div>
      </div>
      <MetricGrid className="mt-[14px]" density="compact" items={items} />
    </GradientPanel>
  );
};
