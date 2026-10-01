import type { EChartsOption } from 'echarts';
import type { FC } from 'react';
import { lineChartOptions } from '@ww-bill/bill-ui';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { renderToString } from 'react-dom/server';
import { CHART_STYLE_FALLBACKS } from '@/shared/config/chart-style-fallbacks';
import { cn } from '@/shared/lib';
import { readAppearanceToken, useAppearanceRevision, withAlpha } from '@/shared/lib/appearance-tokens';
import { useChart } from '@/shared/lib/use-chart';
import { useChartOverview } from '../model/chart-overview-context';
import { TooltipContent } from './TooltipContent';

export const LineChart: FC = () => {
  const { chartDomRef, myChart } = useChart({ preventTouchMove: 'horizontal' });
  const { currentAmountType, curTab } = useChartOverview();
  const appearanceRevision = useAppearanceRevision();

  const seriesData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.data.map(item => ({
      value: Number(item.amount),
      source: item,
    }));
  }, [curTab]);

  const xAxisData = useMemo(() => {
    if (!curTab)
      return [];
    return curTab.data.map(item => item.displayLabel ?? format(item.value, 'MM-dd'));
  }, [curTab]);

  useEffect(() => {
    const appearanceColors = {
      accent: readAppearanceToken('--ww-theme-color-mid', CHART_STYLE_FALLBACKS.primary),
      text: readAppearanceToken('--ww-theme-text-color', CHART_STYLE_FALLBACKS.text),
    };
    const option: EChartsOption = {
      ...lineChartOptions({ data: seriesData, labels: xAxisData, colors: {
        accent: appearanceColors.accent,
        inverse: CHART_STYLE_FALLBACKS.inverse,
        grid: withAlpha(appearanceColors.accent, 0.13),
        fillStart: withAlpha(appearanceColors.accent, 0.35),
        fillEnd: withAlpha(appearanceColors.accent, 0.02),
      } }),
      tooltip: {
        triggerOn: 'mousemove|click',
        appendToBody: true,
        trigger: 'axis',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: [
          'background: transparent',
          'border: 0',
          'border-radius: 18px',
          'box-shadow: none',
          'padding: 0',
        ].join(';'),
        textStyle: {
          color: appearanceColors.text,
        },
        enterable: true,
        position: (point: any, _params: any, dom: any) => {
          const [x, y] = point;
          const { width, height } = dom.getBoundingClientRect();
          const halfWidth = width / 2;
          const viewportPadding = 12;
          const newX = x - halfWidth;
          const newY = y - height - 20;

          if (x + halfWidth > window.innerWidth - viewportPadding) {
            return [window.innerWidth - width - viewportPadding, Math.max(viewportPadding, newY)];
          }
          if (newX < viewportPadding) {
            return [viewportPadding, Math.max(viewportPadding, newY)];
          }
          return [newX, Math.max(viewportPadding, newY)];
        },
        formatter: (_params: any) => {
          const { data } = _params[0];
          const html = renderToString(<TooltipContent data={data.source} currentAmountType={currentAmountType} />);
          return html;
        },
      },

    };

    myChart?.setOption(option);
  }, [appearanceRevision, seriesData, xAxisData, myChart, currentAmountType]);

  useEffect(() => {
    const chartDom = chartDomRef.current;
    if (!chartDom || !myChart || typeof IntersectionObserver === 'undefined')
      return;
    const observer = new IntersectionObserver((entries) => {
      if ((entries[0]?.intersectionRatio ?? 0) >= 0.95)
        myChart.resize();
    }, { threshold: 0.95 });
    observer.observe(chartDom);
    return () => observer.disconnect();
  }, [chartDomRef, myChart]);

  return (
    <div className={cn('mt-[10px] h-[80px] w-[315px] max-w-full')} ref={chartDomRef} />
  );
};
