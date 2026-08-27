import type { ChartOverviewRankingItem } from '@/features/chart-overview';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HouseholdCategoryPieChart } from '@/pages/household-charts/ui/HouseholdCategoryPieChart';

const setOption = vi.fn();

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: { setOption } }),
}));

const ranking: ChartOverviewRankingItem[] = [{
  amount: '12345678.90',
  category: { icon: 'shirt', id: 'clothes', name: '服饰' },
  percentage: '100',
  type: 'sub',
}];

describe('household category pie chart', () => {
  afterEach(() => setOption.mockReset());

  it('shows an adaptive center amount and replaces the complete ECharts option', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(HouseholdCategoryPieChart, { ranking })));

    expect(container.textContent).toContain('¥12345678.90');
    expect((container.querySelector('span.font-number') as HTMLElement).style.fontSize).toBe('11px');
    expect(setOption).toHaveBeenCalledWith(expect.any(Object), { notMerge: true });
    act(() => root.unmount());
  });
});
