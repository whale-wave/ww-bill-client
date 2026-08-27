import type { FC } from 'react';
import { useMemo } from 'react';
import { useTagRankingQuery } from '@/entities/chart';
import { ChartOverviewPresentation, TagRankingSection, useChartOverview } from '@/features/chart-overview';
import { ChartHomeProvider } from '@/pages/chart/chart-home/model/ChartHomeProvider';
import { TabBar } from '@/widgets/layout';

const ChartHomeInner: FC = () => {
  const { curTab, currentAmountType } = useChartOverview();
  const dateRange = useMemo(() => {
    const dates = curTab?.data.map(point => point.value).filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)) ?? [];
    return dates.length ? { endDate: [...dates].sort().at(-1), startDate: [...dates].sort()[0] } : undefined;
  }, [curTab]);
  const tagRanking = useTagRankingQuery({
    params: { type: currentAmountType, ...dateRange },
    enabled: Boolean(dateRange),
  });
  return (
    <>
      <ChartOverviewPresentation tagRanking={<TagRankingSection data={tagRanking.data} isError={tagRanking.isError} isLoading={tagRanking.isLoading} />} />
      <TabBar active={1} />
    </>
  );
};

const ChartHome: FC = () => {
  return (
    <ChartHomeProvider>
      <ChartHomeInner />
    </ChartHomeProvider>
  );
};

export default ChartHome;
