import type { SankeySeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { Asset, AssetGroup } from '@/entities/asset';
import { SpinLoading } from 'antd-mobile';
import { GitBranch, MoveHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useGetAssetGroupQuery, useGetAssetQuery } from '@/entities/asset';
import { CHART_STYLE_FALLBACKS } from '@/shared/config/chart-style-fallbacks';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, formatCompactAmount } from '@/shared/lib/amount';
import { readAppearanceChartColors, readAppearanceToken, useAppearanceRevision } from '@/shared/lib/appearance-tokens';
import { useChart } from '@/shared/lib/use-chart';
import { Surface } from '@/shared/ui';
import { buildAssetSankey } from '../model/asset-sankey';
import { ChartRetryButton } from './ChartRetryButton';

type DisplayMode = 'amount' | 'percent' | 'hidden';

export function AssetSankey() {
  const accounts = useGetAssetQuery();
  const groups = useGetAssetGroupQuery();
  return (
    <AssetSankeyCard
      assets={accounts.data}
      groups={groups.data}
      isError={accounts.isError && !accounts.response}
      isFetching={accounts.isFetching}
      isLoading={accounts.isLoading}
      onRetry={() => void accounts.refetch()}
    />
  );
}

interface AssetSankeyCardProps {
  assets: Asset[];
  groups: AssetGroup[];
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onRetry?: () => void;
}

export function AssetSankeyCard({ assets, groups, isLoading = false, isError = false, isFetching = false, onRetry }: AssetSankeyCardProps) {
  const { t } = useTranslation('asset');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('amount');
  const appearanceRevision = useAppearanceRevision();
  const { chartDomRef, myChart } = useChart({ preventTouchMove: false });
  const model = useMemo(() => buildAssetSankey(assets, groups, {
    totalAsset: t('chart.totalAsset'),
    netAsset: t('chart.netAsset'),
    deficit: t('chart.overviewDeficit'),
    assetSide: t('chart.overviewBalance'),
  }), [assets, groups, t]);
  const hasData = model.links.length > 0;
  const chartHeight = Math.max(340, ...[0, 2, 3].map(depth => (
    model.nodes.filter(node => node.depth === depth).length * 48 + 48
  )));

  useEffect(() => {
    if (!myChart)
      return;
    void appearanceRevision;
    const colors = readAppearanceChartColors();
    const nodeMap = new Map(model.nodes.map(node => [node.id, node]));
    const categoryColors = new Map(model.nodes.filter(node => node.tone === 'group').map((node, index) => (
      [node.id, colors[index % colors.length]]
    )));
    const displayValue = (amount: string, compact = false) => {
      if (displayMode === 'hidden')
        return '';
      if (displayMode === 'percent')
        return `${(Number(amount) / Number(model.flowTotal) * 100).toFixed(1)}%`;
      return `¥${compact ? formatCompactAmount(Number(amount)) : formatAmount(amount)}`;
    };
    const tooltip: TooltipComponentOption = {
      confine: true,
      renderMode: 'richText',
      trigger: 'item',
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (item.dataType === 'edge') {
          const link = model.links[item.dataIndex];
          if (!link)
            return '';
          return `${nodeMap.get(link.source)?.label} → ${nodeMap.get(link.target)?.label}\n${displayValue(link.amount)}`;
        }
        const node = nodeMap.get(item.name);
        return node ? `${node.label}\n${displayValue(node.amount)}` : '';
      },
    };
    const series: SankeySeriesOption = {
      type: 'sankey',
      left: 108,
      right: 116,
      top: 20,
      bottom: 20,
      nodeWidth: 8,
      nodeGap: 32,
      nodeAlign: 'left',
      layoutIterations: 0,
      draggable: false,
      emphasis: { focus: 'none', lineStyle: { opacity: 0.5 } },
      lineStyle: { color: 'source', opacity: 0.25, curveness: 0.5 },
      label: {
        color: readAppearanceToken('--ww-theme-text-color', CHART_STYLE_FALLBACKS.text),
        fontFamily: 'Noto Sans SC, sans-serif',
        fontSize: 11,
        lineHeight: 18,
        width: 96,
        overflow: 'truncate',
      },
      data: model.nodes.map((node) => {
        const parent = model.links.find(link => link.target === node.id)?.source;
        const color = node.tone === 'liability'
          ? colors[1]
          : node.tone === 'net'
            ? colors[3]
            : categoryColors.get(node.id) ?? categoryColors.get(parent ?? '') ?? colors[0];
        return {
          name: node.id,
          depth: node.depth,
          itemStyle: { color },
          label: {
            position: node.depth === 0 ? 'left' : 'right',
            formatter: () => `${node.label}${displayMode === 'hidden' ? '' : `\n${displayValue(node.amount, true)}`}`,
          },
        };
      }),
      links: model.links.map(link => ({ source: link.source, target: link.target, value: Number(link.amount) })),
    };
    myChart.setOption({ tooltip, series: [series], animationDuration: 350 }, { notMerge: true });
    const frame = requestAnimationFrame(() => myChart.resize());
    const observer = new ResizeObserver(() => myChart.resize());
    if (chartDomRef.current)
      observer.observe(chartDomRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [appearanceRevision, chartDomRef, displayMode, model, myChart]);

  const modes = [
    { value: 'amount', label: t('chart.overviewAmount') },
    { value: 'percent', label: t('chart.overviewPercent') },
    { value: 'hidden', label: t('chart.overviewHidden') },
  ] as const;
  const metrics = [
    { label: t('chart.totalAsset'), amount: model.assetTotal },
    { label: t('chart.totalLiability'), amount: model.liabilityTotal },
    { label: t('chart.netAsset'), amount: model.netAsset },
  ];

  return (
    <Surface as="article" className="asset-sankey" material="content">
      <header className="asset-sankey__header">
        <GitBranch className="text-primary-deep" size={20} />
        <div>
          <h2 className="text-[15px] font-extrabold text-ww-ink">{t('chart.overviewTitle')}</h2>
          <p className="text-[12px] text-ww-mid">{t('chart.overviewDescription')}</p>
        </div>
      </header>
      <div aria-label={t('chart.overviewDisplay')} className="asset-sankey__switch" role="group">
        {modes.map(mode => (
          <button
            aria-pressed={displayMode === mode.value}
            key={mode.value}
            onClick={() => setDisplayMode(mode.value)}
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>
      {!isLoading && !isError && (
        <dl className="asset-sankey__metrics">
          {metrics.map(metric => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd aria-label={displayMode === 'hidden' ? undefined : `¥${formatAmount(metric.amount)}`}>
                {displayMode === 'hidden' ? '••••' : `¥${formatCompactAmount(Number(metric.amount))}`}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {!isLoading && !isError && hasData && (
        <p className="asset-sankey__hint">
          <MoveHorizontal size={14} />
          {t('chart.overviewSwipe')}
        </p>
      )}
      <div className="asset-sankey__scroll" hidden={isLoading || isError || !hasData}>
        <div className="asset-sankey__canvas">
          <div aria-hidden="true" className="asset-sankey__columns">
            {[t('chart.overviewSources'), t('chart.overviewPool'), t('chart.overviewCategories'), t('chart.overviewAccounts')].map(label => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div aria-label={t('chart.overviewTitle')} ref={chartDomRef} role="img" style={{ height: chartHeight }} />
        </div>
      </div>
      {isLoading
        ? <div className="asset-sankey__state"><SpinLoading color="primary" /></div>
        : isError
          ? (
              <div className="asset-sankey__state">
                <p>{t('manager.loadError')}</p>
                {onRetry && <ChartRetryButton isLoading={isFetching} onRetry={onRetry} />}
              </div>
            )
          : !hasData
              ? <div className="asset-sankey__state">{t('chart.overviewEmpty')}</div>
              : (
                  <p className="asset-sankey__note">
                    {t('chart.overviewNote')}
                    {Number(model.deficit) > 0 && ` ${t('chart.overviewDeficitNote')}`}
                    {model.hasNegativeBalances && ` ${t('chart.overviewNegativeNote')}`}
                  </p>
                )}
    </Surface>
  );
}
