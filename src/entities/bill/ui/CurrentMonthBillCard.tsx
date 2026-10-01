import type { FC } from 'react';
import type { MetricGridItem } from '@/shared/ui';
import { formatBillOverviewAmount } from '@ww-bill/bill-core';
import { BillOverviewVisual } from '@ww-bill/bill-ui';
import { useTranslation } from '@/shared/i18n';
import { zeroFill } from '@/shared/lib/time';
import { DesignIcon, MetricGrid, Surface } from '@/shared/ui';

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
    { key: 'income', label: t('bill:monthCard.income'), tone: 'income', value: formatBillOverviewAmount(billRecord?.income) },
    { key: 'expend', label: t('bill:monthCard.expend'), tone: 'expense', value: formatBillOverviewAmount(billRecord?.expend) },
    { key: 'surplus', label: t('bill:monthCard.surplus'), tone: 'primary', value: formatBillOverviewAmount(billRecord?.surplus) },
  ];

  return (
    <Surface
      as="article"
      className="bill-overview-surface"
      data-testid="current-month-bill-card"
      material="raised"
    >
      <button aria-label={t('bill:monthCard.title')} className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent" onClick={onClick} type="button" />
      <BillOverviewVisual
        title={t('bill:monthCard.title')}
        period={(
          <>
            {zeroFill(billRecord?.month)}
            {t('common:dateTime.monthSuffix')}
          </>
        )}
        icon={<DesignIcon name="discovery-bill" size={18} />}
        metrics={<MetricGrid density="compact" items={items} />}
      />
    </Surface>
  );
};
