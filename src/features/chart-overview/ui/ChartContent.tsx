import type { FC } from 'react';
import { ErrorBlock } from 'antd-mobile';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useChartOverview } from '../model/chart-overview-context';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { RankingList } from './RankingList';

export const ChartContent: FC = () => {
  const { t } = useTranslation('chart');
  const {
    curTab,
    currentAmountType,
    displayMode = 'line',
    isAmountHidden = false,
    totalLabel,
    totalTestId,
  } = useChartOverview();

  const empty = (
    <div className={cn('flex-grow flex items-center justify-center')}>
      <ErrorBlock status="empty" title={t('emptyTitle')} description={t('emptyDescription')} />
    </div>
  );

  return (
    <div
      className={cn('fixed left-0 right-0 top-[calc(42.94px+42.4px+37.55px)] h-[calc(100%-42.94px-42.4px-37.55px-60px)] overflow-y-auto')}
      data-chart-display={displayMode}
    >
      {!curTab
        ? empty
        : (
            <div className={cn('flex flex-col z-10 pb-10')}>
              <div className={cn('flex flex-col py-2 px-1 border-0 border-b-[1px] border-b-gray-100 border-solid flex-shrink-0')}>
                <div className={cn('flex flex-col px-1')}>
                  <div className={cn('text-sm flex space-x-2')}>
                    <div>{totalLabel ?? (currentAmountType === 'sub' ? t('totalExpend') : t('totalIncome'))}</div>
                    <div data-testid={totalTestId}>{isAmountHidden ? '••••' : curTab.amount}</div>
                  </div>
                  <div className={cn('text-sm flex space-x-2')}>
                    <div>{t('averageLabel')}</div>
                    <div>{isAmountHidden ? '••••' : curTab.average}</div>
                  </div>
                </div>
                {displayMode === 'pie' ? <PieChart /> : <LineChart />}
              </div>
              <RankingList />
            </div>
          )}
    </div>
  );
};
