import { useMount, useUnmount } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';

export function useChart() {
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  const chartDomRef = useRef<HTMLDivElement>(null);

  useMount(() => {
    const myChart = echarts.init(chartDomRef.current!);
    setMyChart(myChart);
  });

  useUnmount(() => {
    myChart?.dispose();
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
