import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import type { Ledger } from '@/entities/ledger';
import type {
  ChartOverviewContextValue,
  ChartOverviewDisplay,
  ChartOverviewMetric,
  ChartOverviewTab,
} from '@/features/chart-overview';
import { format, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns';
import { CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useLedgerChartPeriodOptionsQuery,
  useLedgerChartPeriodQuery,
} from '@/entities/chart';
import {
  LedgerCapability,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  useLedgerPreferencesQuery,
} from '@/entities/ledger';
import {
  ChartOverviewContext,
  ChartOverviewPresentation,
  getChartPeriodName,
} from '@/features/chart-overview';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageLoadingState, Surface } from '@/shared/ui';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

function isMetric(value: string | null): value is LedgerChartMetric {
  return Object.values(LedgerChartMetric).includes(value as LedgerChartMetric);
}

function isPeriod(value: string | null): value is LedgerChartPeriod {
  return Object.values(LedgerChartPeriod).includes(value as LedgerChartPeriod);
}

function isDisplay(value: string | null): value is LedgerChartDisplay {
  return Object.values(LedgerChartDisplay).includes(value as LedgerChartDisplay);
}

function toAmountType(metric: LedgerChartMetric): AmountType {
  return metric === LedgerChartMetric.INCOME ? 'add' : 'sub';
}

function toChartMetric(metric: LedgerChartMetric): ChartOverviewMetric {
  if (metric === LedgerChartMetric.NET)
    return 'net';
  return toAmountType(metric);
}

function toLedgerMetric(metric: ChartOverviewMetric): LedgerChartMetric {
  if (metric === 'net')
    return LedgerChartMetric.NET;
  return metric === 'add' ? LedgerChartMetric.INCOME : LedgerChartMetric.EXPENSE;
}

function toApiMetric(metric: LedgerChartMetric) {
  if (metric === LedgerChartMetric.NET)
    return 'net' as const;
  return metric === LedgerChartMetric.INCOME ? 'income' as const : 'expense' as const;
}

function legacyTabToAnchorDate(tab: string, period: LedgerChartPeriod) {
  if (!tab)
    return undefined;
  if (period === LedgerChartPeriod.YEAR && /^\d{4}$/.test(tab))
    return `${tab}-01-01`;
  const match = tab.match(/^(\d{4})-W?(\d{1,2})$/);
  if (!match)
    return undefined;
  const year = Number(match[1]);
  const value = Number(match[2]);
  if (period === LedgerChartPeriod.MONTH && value >= 1 && value <= 12)
    return `${year}-${String(value).padStart(2, '0')}-01`;
  if (period === LedgerChartPeriod.WEEK && value >= 1 && value <= 53) {
    const date = startOfISOWeek(setISOWeek(setISOWeekYear(new Date(year, 0, 4), year), value));
    return format(date, 'yyyy-MM-dd');
  }
  return undefined;
}

function ChartContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const { t: chartT } = useTranslation('chart');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const metric = isMetric(searchParams.get('metric'))
    ? searchParams.get('metric') as LedgerChartMetric
    : preferenceQuery.data?.defaultChartMetric ?? LedgerChartMetric.EXPENSE;
  const period = isPeriod(searchParams.get('range'))
    ? searchParams.get('range') as LedgerChartPeriod
    : preferenceQuery.data?.defaultChartPeriod ?? LedgerChartPeriod.MONTH;
  const requestedDisplay = isDisplay(searchParams.get('display'))
    ? searchParams.get('display') as LedgerChartDisplay
    : preferenceQuery.data?.defaultChartDisplay ?? LedgerChartDisplay.LINE;
  const display: ChartOverviewDisplay = metric === LedgerChartMetric.NET
    ? 'line'
    : requestedDisplay;
  const apiMetric = toApiMetric(metric);
  const requestedDate = searchParams.get('date');
  const urlTab = searchParams.get('tab') ?? '';
  const requestedAnchor = requestedDate ?? legacyTabToAnchorDate(urlTab, period);
  const periodScope = `${ledgerId}:${apiMetric}:${period}`;
  const bootstrapAnchorRef = useRef<{ anchor?: string; scope: string }>({ scope: '' });
  if (bootstrapAnchorRef.current.scope !== periodScope) {
    bootstrapAnchorRef.current = { anchor: requestedAnchor, scope: periodScope };
  }
  const periodsQuery = useLedgerChartPeriodOptionsQuery({
    params: {
      filters: {
        ...(bootstrapAnchorRef.current.anchor ? { anchorDate: bootstrapAnchorRef.current.anchor } : {}),
        metric: apiMetric,
        pageSize: 6,
        period,
      },
      ledgerId,
    },
  });
  const selectedOption = periodsQuery.options.find(option => option.anchorDate === requestedAnchor)
    ?? periodsQuery.options.at(-1);
  const detailQuery = useLedgerChartPeriodQuery({
    params: {
      filters: {
        anchorDate: selectedOption?.anchorDate ?? '',
        metric: apiMetric,
        period,
      },
      ledgerId,
    },
    queryOptions: { enabled: Boolean(selectedOption) },
  });
  const prefetchPeriod = detailQuery.prefetch;
  const tabs = useMemo(
    () => periodsQuery.options.map(option => ({ key: option.key, name: getChartPeriodName(option, chartT) })),
    [chartT, periodsQuery.options],
  );
  const curTab = useMemo<ChartOverviewTab | undefined>(() => {
    if (!detailQuery.data || !selectedOption)
      return undefined;
    return {
      ...detailQuery.data.tab,
      anchorDate: detailQuery.data.anchorDate,
      name: getChartPeriodName(selectedOption, chartT),
    };
  }, [chartT, detailQuery.data, selectedOption]);
  const chartDateRange = useMemo(() => detailQuery.data
    ? { endDate: detailQuery.data.endDate, startDate: detailQuery.data.startDate }
    : undefined, [detailQuery.data]);

  useEffect(() => {
    if (!selectedOption || (!requestedDate && !urlTab))
      return;
    if (requestedDate === selectedOption.anchorDate && !urlTab)
      return;
    setSearchParams((previous) => {
      previous.set('date', selectedOption.anchorDate);
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [requestedDate, selectedOption, setSearchParams, urlTab]);

  useEffect(() => {
    if (!detailQuery.data || !selectedOption || !prefetchPeriod)
      return;
    periodsQuery.options.forEach((option) => {
      if (option.anchorDate === selectedOption.anchorDate)
        return;
      void prefetchPeriod({
        anchorDate: option.anchorDate,
        metric: apiMetric,
        period,
      });
    });
  }, [apiMetric, detailQuery.data, period, periodsQuery.options, prefetchPeriod, selectedOption]);

  const setSearchValue = useCallback((key: string, value: string, resetTab = false) => {
    setSearchParams((previous) => {
      previous.set(key, value);
      if (resetTab)
        previous.delete('tab');
      if (resetTab)
        previous.delete('date');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const handleDisplayModeChange = useCallback((mode: ChartOverviewDisplay) => {
    if (metric === LedgerChartMetric.NET)
      return;
    setSearchValue('display', mode);
  }, [metric, setSearchValue]);

  const contextValue = useMemo<ChartOverviewContextValue>(() => ({
    currentAmountType: toAmountType(metric),
    currentMetric: toChartMetric(metric),
    currentTimeRangeCategory: period as TimeRangeCategory,
    curTab,
    displayMode: display,
    isAmountHidden: preferenceQuery.data?.hideTotalAmount === true,
    hasNewerPeriods: periodsQuery.hasPreviousPage,
    hasOlderPeriods: periodsQuery.hasNextPage,
    isContentLoading: Boolean(selectedOption) && detailQuery.isLoading && !detailQuery.response,
    isLoadingNewerPeriods: periodsQuery.isFetchingPreviousPage,
    isLoadingOlderPeriods: periodsQuery.isFetchingNextPage,
    loadNewerPeriods: () => void periodsQuery.fetchPreviousPage(),
    loadOlderPeriods: () => void periodsQuery.fetchNextPage(),
    metricOptions: [
      {
        icon: 'huankuanzhichu-copy',
        label: t(`charts.metric.${LedgerChartMetric.EXPENSE}`),
        value: 'sub',
      },
      {
        icon: 'jiekuanshouru-copy',
        label: t(`charts.metric.${LedgerChartMetric.INCOME}`),
        value: 'add',
      },
      {
        icon: 'chart',
        label: t(`charts.metric.${LedgerChartMetric.NET}`),
        value: 'net',
      },
    ],
    onDisplayModeChange: metric === LedgerChartMetric.NET ? undefined : handleDisplayModeChange,
    onMetricChange: value => setSearchValue('metric', toLedgerMetric(value), true),
    onRankingItemClick: (item) => {
      if (!chartDateRange || metric === LedgerChartMetric.NET)
        return;
      navigate(ROUTES_PATH.LEDGER_CHART_CATEGORY.getPath(ledgerId), {
        state: {
          amount: item.amount,
          category: item.category,
          ...chartDateRange,
          percentage: item.percentage,
          periodName: curTab?.name ?? '',
          type: toAmountType(metric),
        },
      });
    },
    rankingEmptyContent: metric === LedgerChartMetric.NET
      ? t('charts.netNoRanking')
      : undefined,
    setCurrentAmountType: value =>
      setSearchValue('metric', toLedgerMetric(value), true),
    setCurrentTimeRangeCategory: value => setSearchValue('range', value, true),
    setTabActive: (value) => {
      const option = periodsQuery.options.find(item => item.key === value);
      if (!option)
        return;
      setSearchParams((previous) => {
        previous.set('date', option.anchorDate);
        previous.delete('tab');
        return previous;
      }, { replace: true });
    },
    tabActive: selectedOption?.key ?? '',
    tabs,
    totalLabel: metric === LedgerChartMetric.NET
      ? t('charts.total')
      : undefined,
    totalTestId: 'ledger-chart-total',
  }), [
    curTab,
    detailQuery,
    display,
    handleDisplayModeChange,
    metric,
    period,
    preferenceQuery.data?.hideTotalAmount,
    chartDateRange,
    ledgerId,
    navigate,
    setSearchValue,
    t,
    tabs,
    periodsQuery,
    selectedOption,
    setSearchParams,
  ]);

  const hasChartData = Boolean(periodsQuery.response);
  const hasPreferenceData = Boolean(preferenceQuery.response);
  const isInitialLoading = (periodsQuery.isLoading && !hasChartData) || (preferenceQuery.isLoading && !hasPreferenceData);
  const isBlockingError = (periodsQuery.isError && !hasChartData) || (preferenceQuery.isError && !hasPreferenceData);

  if (isInitialLoading) {
    return <PageLoadingState label={t('common:nav.loading')} testId="ledger-charts-loading" />;
  }
  if (isBlockingError) {
    return (
      <div className="flex flex-grow items-center justify-center px-[var(--ww-page-gutter)]">
        <Surface className="w-full max-w-[520px] overflow-hidden" material="content">
          <IllustratedEmptyState
            actionLabel={t('common.retry')}
            description={t('common.loadErrorDescription')}
            icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
            onAction={() => {
              void periodsQuery.refetch();
              void detailQuery.refetch();
              void preferenceQuery.refetch();
            }}
            title={t('common.loadError')}
          />
        </Surface>
      </div>
    );
  }

  return (
    <ChartOverviewContext.Provider value={contextValue}>
      <ChartOverviewPresentation />
    </ChartOverviewContext.Provider>
  );
}

function LedgerChartsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  return (
    <>
      <ChartContent ledgerId={ledgerId} />
      <LedgerWorkspaceTabBar
        activeKey="charts"
        capabilities={ledger.capabilities}
        ledgerId={ledgerId}
      />
    </>
  );
}

export default function LedgerChartsPage() {
  return (
    <div className="page-new overflow-hidden bg-white">
      <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
        {scope => <LedgerChartsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
