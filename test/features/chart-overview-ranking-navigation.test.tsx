import type { ChartOverviewContextValue } from '@/features/chart-overview';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ChartOverviewContext, RankingList } from '@/features/chart-overview';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderRanking() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const value: ChartOverviewContextValue = {
    currentAmountType: 'sub',
    currentTimeRangeCategory: 'custom',
    customRange: { endDate: '2026-09-19T23:59:59', startDate: '2026-09-01T00:00:00' },
    curTab: {
      amount: 90,
      average: '90.00',
      data: [],
      key: 'custom',
      name: '2026-09-01 — 2026-09-19',
      ranking: [{ amount: 90, category: { icon: 'shirt', id: 11, name: '服饰' }, percentage: '100', type: 'sub' }],
    },
    setCurrentAmountType: () => undefined,
    setCurrentTimeRangeCategory: () => undefined,
    setTabActive: () => undefined,
    tabActive: '',
    tabs: [],
  };
  act(() => root.render(
    <MemoryRouter initialEntries={['/chart']}>
      <ChartOverviewContext.Provider value={value}>
        <RankingList />
      </ChartOverviewContext.Provider>
      <LocationProbe />
    </MemoryRouter>,
  ));
  return { container, root };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('chart ranking navigation', () => {
  it('carries custom range endpoints into category detail', () => {
    const { container, root } = renderRanking();
    const item = container.querySelector<HTMLButtonElement>('[data-chart-ranking-item="11"]');

    act(() => item?.click());

    const search = new URLSearchParams(container.querySelector('[data-testid="location-search"]')?.textContent ?? '');
    expect(search.get('category')).toBe('custom');
    expect(search.get('startDate')).toBe('2026-09-01T00:00:00');
    expect(search.get('endDate')).toBe('2026-09-19T23:59:59');
    act(() => root.unmount());
  });
});
