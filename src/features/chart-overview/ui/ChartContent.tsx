import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { GradientPanel, MetricGrid, PageLoadingState } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';
import { ChartDisplaySwitch } from './ChartDisplaySwitch';
import { ChartEmptyState } from './ChartEmptyState';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { RankingList } from './RankingList';

interface ChartContentProps {
  pieChart?: ReactNode;
}

export const ChartContent: FC<ChartContentProps> = ({ pieChart }) => {
  const { t } = useTranslation(['chart', 'common']);
  const {
    curTab,
    currentAmountType,
    displayMode = 'line',
    onDisplayModeChange,
    isAmountHidden = false,
    isContentLoading = false,
    totalLabel,
    totalTestId,
  } = useChartOverview();

  return (
    <div
      className={cn('ww-tab-bar-scroll-padding min-h-0 flex flex-grow flex-col overflow-y-auto px-[18px]')}
      data-chart-display={displayMode}
    >
      {onDisplayModeChange && (
        <div className="flex shrink-0 justify-end pb-2" data-chart-display-toolbar>
          <ChartDisplaySwitch value={displayMode} onChange={onDisplayModeChange} />
        </div>
      )}
      {isContentLoading
        ? <div className="flex min-h-[212px] items-center justify-center"><PageLoadingState compact label={t('common:nav.loading')} /></div>
        : !curTab
            ? <ChartEmptyState />
            : (
                <div className={cn('flex flex-col gap-[14px] pb-4')}>
                  <GradientPanel
                    className="h-[212.5px] flex-shrink-0 overflow-hidden px-5 pb-4 pt-5"
                    elevation="high"
                    surface="chart"
                  >
                    <MetricGrid
                      columns={2}
                      items={[
                        {
                          key: 'total',
                          label: totalLabel ?? (currentAmountType === 'sub' ? t('totalExpend') : t('totalIncome')),
                          suffix: '¥',
                          tone: 'default',
                          value: <span data-testid={totalTestId}>{isAmountHidden ? '••••' : String(curTab.amount).replace(/^¥/, '')}</span>,
                        },
                        {
                          key: 'average',
                          label: t('averageLabel'),
                          suffix: '¥',
                          tone: 'muted',
                          value: isAmountHidden ? '••••' : String(curTab.average).replace(/^¥/, ''),
                        },
                      ]}
                      variant="chart-summary"
                    />
                    {displayMode === 'pie' ? pieChart ?? <PieChart /> : <LineChart />}
                  </GradientPanel>
                  <RankingList />
                </div>
              )}
    </div>
  );
};
