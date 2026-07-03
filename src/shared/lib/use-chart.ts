import { useMount, useUnmount } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { echarts } from '@/shared/lib/echarts';

export function useChart() {
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

    const handleTouchEnd = () => {
      myChart.dispatchAction({
        type: 'updateAxisPointer',
        currTrigger: 'leave',
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    chartDom.addEventListener('touchmove', handleTouchMove, { passive: false });
    chartDom.addEventListener('touchend', handleTouchEnd);
    chartDom.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      chartDom.removeEventListener('touchmove', handleTouchMove);
      chartDom.removeEventListener('touchend', handleTouchEnd);
      chartDom.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [myChart]);

  return {
    chartDomRef,
    myChart,
  };
}
