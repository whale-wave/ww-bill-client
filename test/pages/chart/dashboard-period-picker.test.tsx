import type { PropsWithChildren } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDashboardPeriodBounds, getDashboardPeriodChoices, getDashboardPeriodTitle, getDashboardPeriodYear } from '@/widgets/chart-dashboard/model/dashboard-period-picker';
import { localDate } from '@/widgets/chart-dashboard/model/useChartDashboardUrlState';
import { ChartDashboardPeriodSheet } from '@/widgets/chart-dashboard/ui/ChartDashboardPeriodSheet';

vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/ui', () => ({
  AppSheet: ({ children, visible }: PropsWithChildren<{ visible: boolean }>) => visible ? <div>{children}</div> : null,
  SheetHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
}));

const translate = (key: string, options?: Record<string, unknown>) => options ? `${key}:${JSON.stringify(options)}` : key;
let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  vi.useRealTimers();
});

describe('chart dashboard period picker', () => {
  it('uses the Shanghai date for the current period', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-27T16:30:00Z'));
    expect(localDate()).toBe('2026-09-28');
  });

  it('names current and previous weeks across an ISO week-year boundary', () => {
    expect(getDashboardPeriodBounds('week', new Date('2021-01-01T12:00:00'))).toEqual(['2020-12-28', '2021-01-03']);
    expect(getDashboardPeriodYear('week', '2021-01-01')).toBe(2020);
    expect(getDashboardPeriodTitle('week', '2020-12-28', '2021-01-01', translate)).toBe('tab.thisWeek');
    expect(getDashboardPeriodTitle('week', '2020-12-21', '2021-01-01', translate)).toBe('tab.lastWeek');
    expect(getDashboardPeriodTitle('week', '2018-12-31', '2021-01-01', translate)).toBe('tab.yearWeekNumber:{"year":2019,"week":1}');
    const choices = getDashboardPeriodChoices('week', 2020, '2021-01-01');
    expect(choices).toHaveLength(53);
    expect(choices[0]).toEqual({ anchorDate: '2020-12-28', startDate: '2020-12-28', endDate: '2021-01-03' });
  });

  it('names months across a calendar year and excludes future periods', () => {
    expect(getDashboardPeriodTitle('month', '2026-01-01', '2026-01-05', translate)).toBe('tab.thisMonth');
    expect(getDashboardPeriodTitle('month', '2025-12-01', '2026-01-05', translate)).toBe('tab.lastMonth');
    expect(getDashboardPeriodTitle('month', '2025-11-01', '2026-01-05', translate)).toBe('tab.yearMonthNumber:{"year":2025,"month":11}');
    expect(getDashboardPeriodChoices('month', 2026, '2026-01-05')).toEqual([
      { anchorDate: '2026-01-01', startDate: '2026-01-01', endDate: '2026-01-31' },
    ]);
    expect(getDashboardPeriodChoices('year', 2026, '2026-09-28')[0].anchorDate).toBe('2026-01-01');
  });

  it('lets the user choose an older month from the bottom sheet', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    unmount = () => act(() => root.unmount());
    const onSelect = vi.fn();
    act(() => root.render(createElement(ChartDashboardPeriodSheet, {
      anchorDate: '2026-09-01',
      onClose: vi.fn(),
      onSelect,
      period: 'month',
      selectedStart: '2026-09-01',
      today: '2026-09-28',
      visible: true,
    })));
    expect(container.querySelector('button[aria-pressed="true"]')?.textContent).toContain('2026-09-01');
    const august = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('2026-08-01 — 2026-08-31'));
    act(() => august?.click());
    expect(onSelect).toHaveBeenCalledWith('2026-08-01');
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="dashboard.earlierYear"]')?.click());
    expect(container.querySelector('button[aria-label="dashboard.laterYear"]')?.hasAttribute('disabled')).toBe(false);
    expect(container.textContent).toContain('2025-12-01 — 2025-12-31');
  });
});
