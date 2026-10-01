export interface LineChartColors {
  accent: string;
  inverse: string;
  grid: string;
  fillStart: string;
  fillEnd: string;
}

/** Shared chart appearance; each host supplies its renderer and interaction. */
export function lineChartOptions<T extends { value: number }>({ data, labels, colors }: { data: T[]; labels: string[]; colors: LineChartColors }) {
  return {
    grid: { top: 8, left: 5, right: 5, bottom: 4 },
    xAxis: { boundaryGap: false, type: 'category' as const, data: labels, axisLine: { show: false }, axisTick: { lineStyle: { opacity: 0 } }, axisLabel: { show: false } },
    yAxis: { type: 'value' as const, axisLabel: { show: false }, splitLine: { lineStyle: { color: colors.grid, type: 'dashed' as const } }, show: true },
    series: [{
      data,
      type: 'line' as const,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: (params: { data: unknown }) => (params.data as { value: number }).value === 0 ? colors.inverse : colors.accent, borderColor: colors.accent, borderWidth: 2 },
      lineStyle: { color: colors.accent, width: 2 },
      areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.fillStart }, { offset: 1, color: colors.fillEnd }] } },
    }],
  };
}
