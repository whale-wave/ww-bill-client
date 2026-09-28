import type { PropsWithChildren, ReactNode } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChartDashboardHome } from '@/widgets/chart-dashboard';

vi.mock('@/entities/asset', () => ({ useGetAssetQuery: () => ({ data: [] }) }));
vi.mock('@/entities/household', () => ({ useHouseholdRecordFilterOptionsQuery: () => ({ data: { capabilities: { tag: false }, members: [], tags: [] } }) }));
vi.mock('@/entities/ledger', () => ({ useGetLedgersQuery: () => ({ data: [] }) }));
vi.mock('@/entities/record', () => ({ useRecordFilterOptionsQuery: () => ({ data: { capabilities: { tag: false }, tags: [] } }) }));
vi.mock('@/entities/user', () => ({ useGetUserUserInfoQuery: () => ({ data: { id: 1 } }) }));
vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/ui', () => ({
  AppButton: ({ children, size: _size, variant: _variant, ...props }: PropsWithChildren<{ 'aria-label'?: string; 'className'?: string; 'disabled'?: boolean; 'onClick'?: () => void; 'size'?: string; 'variant'?: string }>) => <button {...props} type="button">{children}</button>,
  AppSheet: ({ children, visible }: PropsWithChildren<{ visible: boolean }>) => visible ? <div>{children}</div> : null,
  SheetHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
  Surface: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
vi.mock('@/widgets/chart-dashboard/model/useChartDashboardQueries', () => ({
  useChartDashboardQueries: () => ({ assetQuery: { data: undefined }, dashboardQuery: { data: undefined, isError: false, isLoading: false } }),
}));
vi.mock('@/widgets/chart-dashboard/ui/ChartDashboardFilterSheet', () => ({ ChartDashboardFilterSheet: () => null }));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
}

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
  vi.useRealTimers();
});

describe('chart dashboard period navigation', () => {
  it('opens the date sheet and keeps the selected month in the URL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T04:00:00Z'));
    const container = document.createElement('div');
    const root = createRoot(container);
    unmount = () => act(() => root.unmount());
    act(() => root.render(
      <MemoryRouter initialEntries={['/chart?range=month&date=2026-09-28&metric=expense']}>
        <ChartDashboardHome scope={{ kind: 'personal' }} />
        <LocationProbe />
      </MemoryRouter>,
    ));

    const trigger = container.querySelector<HTMLButtonElement>('button[aria-label^="dashboard.choosePeriod"]');
    expect(trigger?.textContent).toContain('tab.thisMonth');
    expect(trigger?.textContent).toContain('2026-09-01 — 2026-09-30');
    act(() => trigger?.click());
    expect(container.textContent).toContain('dashboard.choosePeriod');
    const august = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('2026-08-01 — 2026-08-31'));
    act(() => august?.click());
    expect(container.querySelector('[data-testid="location"]')?.textContent).toContain('date=2026-08-01');
    expect(container.querySelector<HTMLButtonElement>('button[aria-label^="dashboard.choosePeriod"]')?.textContent).toContain('tab.lastMonth');
  });
});
