import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import type { HouseholdPieSegment } from '../model/pie-segments';
import type { ChartOverviewRankingItem } from '@/features/chart-overview';
import { useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, getDonutAmountSize } from '@/shared/lib';
import { useChart } from '@/shared/lib/use-chart';
import { DonutChart } from '@/shared/ui';
import { mapHouseholdPieSegments } from '../model/pie-segments';

interface HouseholdCategoryPieChartProps {
  ranking: ChartOverviewRankingItem[];
}

interface HouseholdCategoryPieCanvasProps {
  centerAmount: string;
  centerLabel: string;
  segments: HouseholdPieSegment[];
}

const HouseholdCategoryPieCanvas: FC<HouseholdCategoryPieCanvasProps> = ({ centerAmount, centerLabel, segments }) => {
  const { chartDomRef, myChart } = useChart();
  const chartData = useMemo(() => segments.map(segment => ({
    id: segment.key,
    itemStyle: { color: segment.color },
    name: segment.name,
    value: Number(String(segment.amount).replace(/,/g, '')),
  })), [segments]);

  useEffect(() => {
    const option: EChartsOption = {
      series: [{
        data: chartData,
        emphasis: { scaleSize: 4 },
        label: { show: false },
        labelLine: { show: false },
        radius: ['42%', '72%'],
        type: 'pie',
      }],
      tooltip: { trigger: 'item' },
    };
    myChart?.setOption(option, { notMerge: true });
  }, [chartData, myChart]);

  return (
    <DonutChart
      amount={centerAmount}
      amountSize={getDonutAmountSize(`¥${centerAmount}`)}
      chart={(
        <div className="h-full w-full" data-household-pie-chart ref={chartDomRef} />
      )}
      label={centerLabel}
      legend={(
        <div className="space-y-2" data-household-pie-legend>
          {segments.map(segment => (
            <div className="flex min-w-0 items-center gap-2 text-[12px] leading-4 text-ww-mid" key={segment.key}>
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="min-w-0 flex-1 truncate">{segment.name}</span>
              <span className="shrink-0 font-semibold">
                {segment.percentage}
                %
              </span>
            </div>
          ))}
        </div>
      )}
      marker="household"
    />
  );
};

export const HouseholdCategoryPieChart: FC<HouseholdCategoryPieChartProps> = ({ ranking }) => {
  const { t } = useTranslation('chart');
  const segments = useMemo(
    () => mapHouseholdPieSegments(ranking, { otherLabel: t('other') }),
    [ranking, t],
  );
  const totalAmount = formatAmount(segments.reduce((sum, segment) => sum + Number(String(segment.amount).replace(/,/g, '')), 0));

  if (!segments.length) {
    return (
      <div className="mt-2 flex h-[112px] items-center justify-center text-[12px] font-semibold text-ww-soft" data-household-pie-empty>
        {t('noCategoryData')}
      </div>
    );
  }

  return <HouseholdCategoryPieCanvas centerAmount={totalAmount} centerLabel={t('categoryAmount')} segments={segments} />;
};
