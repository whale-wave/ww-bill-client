import type { TagRankingResponse } from '@/entities/chart';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagRankingSection } from '@/features/chart-overview';
import { CategoryDetail } from '@/pages/chart-scope-category/ChartScopeCategoryPage';
import ChartCategory from '@/pages/chart/chart-category/ChartCategoryPage';

const hooks = vi.hoisted(() => ({
  getChart: vi.fn(),
  tagRanking: vi.fn(),
}));

vi.mock('@/entities/chart', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/chart')>(),
  useGetChartQuery: hooks.getChart,
  useTagRankingQuery: hooks.tagRanking,
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({
    chartDomRef: { current: null },
    myChart: { resize: vi.fn(), setOption: vi.fn() },
  }),
}));

const record = {
  amount: '90.00',
  category: { icon: 'shirt', id: 11, name: '服饰' },
  id: 1,
  remark: '衣服',
  time: '2026-08-24T06:15:40.000Z',
};

const state = {
  amount: '90.00',
  category: { icon: 'shirt', id: 11, name: '服饰' },
  endDate: '2026-08-25T06:15:40.000Z',
  percentage: '100',
  periodName: '本周',
  startDate: '2026-08-24T06:15:40.000Z',
  type: 'sub' as const,
};

const tagRanking: TagRankingResponse = {
  items: [{ amount: '90.00', key: 'aggregate:untagged', name: '无标签', percentage: 100, tagId: null }],
  totalAmount: '90.00',
};

function assertNormalLayout(container: HTMLElement) {
  const markers = [
    '[data-chart-category-trend]',
    '[data-record-ranking]',
    '[data-tag-ranking-donut]',
    '[data-tag-ranking-rows]',
  ].map(selector => container.querySelector(selector));

  expect(markers.every(Boolean)).toBe(true);
  for (let index = 0; index < markers.length - 1; index++) {
    expect(Boolean(markers[index]!.compareDocumentPosition(markers[index + 1]!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  }
}

function render(element: React.ReactElement) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root };
}

describe('category detail chart layout', () => {
  afterEach(() => {
    hooks.getChart.mockReset();
    hooks.tagRanking.mockReset();
  });

  it('keeps the default category detail line-only and ordered', () => {
    hooks.getChart.mockReturnValue({ data: [], isError: false, isFetching: false });
    hooks.tagRanking.mockReturnValue({ data: tagRanking, isError: false, isLoading: false });
    const { container, root } = render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/chart/category',
          search: '?categoryId=11&type=sub&category=week',
          state: {
            amountType: 'sub',
            categoryId: '11',
            curTab: {
              amount: 90,
              average: '90.00',
              data: [{ amount: 90, data: [record], type: 'day', value: '2026-08-24' }],
              key: '2026-34',
              name: '本周',
              ranking: [{ amount: 90, category: record.category, percentage: '100', type: 'sub' }],
            },
            rankingItem: { amount: 90, category: record.category, percentage: '100', type: 'sub' },
            tabKey: '2026-34',
            tabName: '本周',
            timeRangeCategory: 'week',
          },
        }]}
      >
        <ChartCategory />
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-chart-display-switch]')).toBeNull();
    assertNormalLayout(container);
    act(() => root.unmount());
  });

  it('keeps scope category detail line-only and ordered', () => {
    const { container, root } = render(
      <MemoryRouter>
        <CategoryDetail
          records={[record] as never}
          state={state}
          tagRanking={<TagRankingSection data={tagRanking} />}
          toRecord={id => `/editing/${id}`}
        />
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-chart-display-switch]')).toBeNull();
    assertNormalLayout(container);
    act(() => root.unmount());
  });
});
