import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import type { HouseholdPieSegment } from '../model/pie-segments';
import type { ChartOverviewRankingItem } from '@/features/chart-overview';
import { useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { useChart } from '@/shared/lib/use-chart';
import { mapHouseholdPieSegments } from '../model/pie-segments';

interface HouseholdCategoryPieChartProps {
  ranking: ChartOverviewRankingItem[];
}

interface HouseholdCategoryPieCanvasProps {
  centerLabel: string;
  segments: HouseholdPieSegment[];
}

const HouseholdCategoryPieCanvas: FC<HouseholdCategoryPieCanvasProps> = ({ centerLabel, segments }) => {
  const { chartDomRef, myChart } = useChart();
  const chartData = useMemo(() => segments.map(segment => ({
    id: segment.key,
    itemStyle: { color: segment.color },
    name: segment.name,
    value: Number(segment.amount),
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
    myChart?.setOption(option);
  }, [chartData, myChart]);

  return (
    <div className="flex h-[112px] min-w-0 items-center gap-3" data-household-pie-chart>
      <div className="relative h-[112px] w-[112px] shrink-0">
        <div className="h-full w-full" ref={chartDomRef} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] font-bold leading-[14px] text-ww-mid">
          {centerLabel}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5" data-household-pie-legend>
        {segments.map(segment => (
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] leading-[16px] text-ww-mid" key={segment.key}>
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="min-w-0 flex-1 truncate">{segment.name}</span>
            <span className="shrink-0 font-semibold">
              {segment.percentage}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HouseholdCategoryPieChart: FC<HouseholdCategoryPieChartProps> = ({ ranking }) => {
  const { t } = useTranslation('chart');
  const segments = useMemo(
    () => mapHouseholdPieSegments(ranking, { otherLabel: t('other') }),
    [ranking, t],
  );

  if (!segments.length) {
    return (
      <div className="mt-2 flex h-[112px] items-center justify-center text-[12px] font-semibold text-ww-soft" data-household-pie-empty>
        {t('noCategoryData')}
      </div>
    );
  }

  return <HouseholdCategoryPieCanvas centerLabel={t('categoryRatio')} segments={segments} />;
};
