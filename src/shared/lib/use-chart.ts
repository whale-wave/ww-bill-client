import { useMount, useUnmount } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { echarts } from '@/shared/lib/echarts';

interface UseChartOptions {
  preventTouchMove?: boolean | 'horizontal';
}

export function useChart({ preventTouchMove = true }: UseChartOptions = {}) {
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  const chartDomRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts>();

  useMount(() => {
    const chartDom = chartDomRef.current;
    if (!chartDom)
      return;

    const chart = echarts.getInstanceByDom(chartDom) ?? echarts.init(chartDom);
    chartInstanceRef.current = chart;
    setMyChart(chart);
  });

  useUnmount(() => {
    chartInstanceRef.current?.dispose();
    chartInstanceRef.current = undefined;
  });

  useEffect(() => {
    if (!myChart)
      return;

    const chartDom = chartDomRef.current!;
    let touchOrigin: { x: number; y: number } | undefined;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchOrigin = touch ? { x: touch.clientX, y: touch.clientY } : undefined;
    };

    const handleTouchEnd = () => {
      touchOrigin = undefined;
      myChart.dispatchAction({
        type: 'updateAxisPointer',
        currTrigger: 'leave',
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventTouchMove === 'horizontal') {
        const touch = e.touches[0];
        if (!touch || !touchOrigin || Math.abs(touch.clientX - touchOrigin.x) <= Math.abs(touch.clientY - touchOrigin.y))
          return;
      }
      e.preventDefault();
    };

    if (preventTouchMove === 'horizontal')
      chartDom.addEventListener('touchstart', handleTouchStart, { passive: true });
    if (preventTouchMove)
      chartDom.addEventListener('touchmove', handleTouchMove, { passive: false });
    chartDom.addEventListener('touchend', handleTouchEnd);
    chartDom.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      if (preventTouchMove === 'horizontal')
        chartDom.removeEventListener('touchstart', handleTouchStart);
      if (preventTouchMove)
        chartDom.removeEventListener('touchmove', handleTouchMove);
      chartDom.removeEventListener('touchend', handleTouchEnd);
      chartDom.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [myChart, preventTouchMove]);

  return {
    chartDomRef,
    myChart,
  };
}
