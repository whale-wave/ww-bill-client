import type { FC } from 'react';
import { ErrorBlock } from 'antd-mobile';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { GradientPanel, MetricGrid } from '@/shared/ui';
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
      className={cn('min-h-0 flex-grow overflow-y-auto px-[18px] pb-5')}
      data-chart-display={displayMode}
    >
      {!curTab
        ? empty
        : (
            <div className={cn('flex flex-col gap-[14px] pb-4')}>
              <GradientPanel
                className="h-[212.5px] flex-shrink-0 overflow-hidden px-5 pb-4 pt-5"
                elevation="high"
                surface="chart"
              >
                <MetricGrid
                  align="start"
                  className="h-[62.5px] [&>div]:px-0 [&>div+div]:pl-7"
                  columns={2}
                  density="chart"
                  items={[
                    {
                      key: 'total',
                      label: totalLabel ?? (currentAmountType === 'sub' ? t('totalExpend') : t('totalIncome')),
                      tone: 'default',
                      value: <span data-testid={totalTestId}>{isAmountHidden ? '••••' : String(curTab.amount).replace(/^¥/, '')}</span>,
                    },
                    {
                      key: 'average',
                      label: t('averageLabel'),
                      tone: 'muted',
                      value: isAmountHidden ? '••••' : String(curTab.average).replace(/^¥/, ''),
                    },
                  ]}
                />
                {displayMode === 'pie' ? <PieChart /> : <LineChart />}
              </GradientPanel>
              <RankingList />
            </div>
          )}
    </div>
  );
};
