import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { MetricGrid, PageLoadingState, Surface } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';
import { ChartDisplaySwitch } from './ChartDisplaySwitch';
import { ChartEmptyState } from './ChartEmptyState';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { RankingList } from './RankingList';

interface ChartContentProps {
  pieChart?: ReactNode;
  tagRanking?: ReactNode;
}

export const ChartContent: FC<ChartContentProps> = ({ pieChart, tagRanking }) => {
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
      {isContentLoading
        ? <div className="flex min-h-[212px] items-center justify-center"><PageLoadingState compact label={t('common:nav.loading')} /></div>
        : !curTab
            ? <ChartEmptyState />
            : (
                <div className={cn('flex shrink-0 flex-col gap-[14px] pb-4')}>
                  <Surface
                    className={cn(
                      onDisplayModeChange ? 'h-[208px] pt-3' : 'h-[192px] pt-3',
                      'relative flex-shrink-0 overflow-hidden px-4 pb-3',
                    )}
                    material="raised"
                  >
                    {onDisplayModeChange && (
                      <div className="absolute right-3 top-2 z-10" data-chart-display-toolbar>
                        <ChartDisplaySwitch compact value={displayMode} onChange={onDisplayModeChange} />
                      </div>
                    )}
                    <div className={onDisplayModeChange ? 'pt-7' : undefined}>
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
                    </div>
                    {displayMode === 'pie' ? pieChart ?? <PieChart /> : <LineChart />}
                  </Surface>
                  <RankingList betweenSections={tagRanking} />
                </div>
              )}
      {/* A near-fit ranking still needs room to move above the floating tab bar. */}
      {curTab && !isContentLoading && <div aria-hidden="true" className="h-16 shrink-0" data-chart-scroll-spacer />}
    </div>
  );
};
