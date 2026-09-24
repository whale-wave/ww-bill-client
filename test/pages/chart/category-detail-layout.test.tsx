import type { TagRankingResponse } from '@/entities/chart';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TagRankingSection } from '@/features/chart-overview';
import { CategoryDetail } from '@/pages/chart-scope-category/ChartScopeCategoryPage';
import ChartCategory from '@/pages/chart/chart-category/ChartCategoryPage';

const hooks = vi.hoisted(() => ({
  getChart: vi.fn(),
  records: vi.fn(),
  tagRanking: vi.fn(),
}));

vi.mock('@/entities/chart', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/chart')>(),
  useChartPeriodQuery: hooks.getChart,
  useTagRankingQuery: hooks.tagRanking,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/record')>(),
  useInfiniteRecordsQuery: hooks.records,
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
  beforeEach(() => {
    hooks.records.mockReturnValue({ records: [], isError: false, isLoading: false, hasNextPage: false });
  });

  afterEach(() => {
    hooks.getChart.mockReset();
    hooks.records.mockReset();
    hooks.tagRanking.mockReset();
  });

  it('keeps the default category detail line-only and ordered', () => {
    hooks.getChart.mockReturnValue({
      data: {
        anchorDate: '2026-08-17',
        endDate: '2026-08-23',
        metric: 'expense',
        period: 'week',
        startDate: '2026-08-17',
        tab: {
          amount: 90,
          average: '90.00',
          data: [{ amount: 90, data: [record], displayLabel: '08-24', type: 'day', value: '2026-08-24' }],
          key: '2026-W34',
          ranking: [{ amount: 90, category: record.category, percentage: '100', type: 'sub' }],
        },
      },
      isError: false,
      isFetching: false,
    });
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

  it('loads category detail for a custom chart range', () => {
    hooks.getChart.mockReturnValue({
      data: {
        anchorDate: '2026-09-01',
        endDate: '2026-09-19',
        metric: 'expense',
        period: 'month',
        startDate: '2026-09-01',
        tab: {
          amount: 90,
          average: '90.00',
          data: [{ amount: 90, data: [record], displayLabel: '09-01', type: 'day', value: '2026-09-01' }],
          key: 'custom',
          ranking: [{ amount: 90, category: record.category, percentage: '100', type: 'sub' }],
        },
      },
      isError: false,
      isFetching: false,
    });
    hooks.tagRanking.mockReturnValue({ data: tagRanking, isError: false, isLoading: false });
    const { container, root } = render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/chart/category',
          search: '?categoryId=11&type=sub&category=custom&startDate=2026-09-01T00:00:00&endDate=2026-09-19T23:59:59',
          state: {
            amountType: 'sub',
            categoryId: '11',
            curTab: {
              amount: 90,
              average: '90.00',
              data: [{ amount: 90, data: [record], type: 'day', value: '2026-09-01' }],
              key: 'custom',
              name: '2026-09-01 — 2026-09-19',
              ranking: [{ amount: 90, category: record.category, percentage: '100', type: 'sub' }],
            },
            rankingItem: { amount: 90, category: record.category, percentage: '100', type: 'sub' },
            timeRangeCategory: 'custom',
          },
        }]}
      >
        <ChartCategory />
      </MemoryRouter>,
    );

    assertNormalLayout(container);
    expect(hooks.getChart).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({
        anchorDate: '2026-09-01',
        categoryId: 11,
        endDate: '2026-09-19T23:59:59+08:00',
        period: 'month',
        startDate: '2026-09-01T00:00:00+08:00',
      }),
    }));
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
