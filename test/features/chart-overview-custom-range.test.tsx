import type { ComponentProps } from 'react';
import type { ChartOverviewCustomRange } from '@/features/chart-overview';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CustomRangeSheet,
  formatChartOverviewCustomRangeSummary,
  isCustomRangeWithinLimit,
} from '@/features/chart-overview';

let cleanup: (() => void) | undefined;

function renderSheet(overrides: Partial<ComponentProps<typeof CustomRangeSheet>> = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const onApply = vi.fn();
  act(() => root.render(<CustomRangeSheet onApply={onApply} onClose={vi.fn()} visible {...overrides} />));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, onApply };
}

function range(startDate: string, endDate: string): ChartOverviewCustomRange {
  return { endDate, startDate };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
});

describe('chart overview custom range', () => {
  it('summarizes a whole-day range with dates only', () => {
    expect(formatChartOverviewCustomRangeSummary(range('2026-09-01T00:00:00', '2026-09-19T23:59:59')))
      .toBe('2026-09-01 — 2026-09-19');
  });

  it('keeps seconds visible when a range uses a partial day', () => {
    expect(formatChartOverviewCustomRangeSummary(range('2026-09-01T08:30:00', '2026-09-19T18:00:00')))
      .toBe('2026-09-01 08:30:00 — 2026-09-19 18:00:00');
  });

  it('allows a range through the same calendar date three years later', () => {
    expect(isCustomRangeWithinLimit(range('2023-09-19T00:00:00', '2026-09-19T23:59:59'))).toBe(true);
    expect(isCustomRangeWithinLimit(range('2023-09-19T00:00:00', '2026-09-20T00:00:00'))).toBe(false);
  });

  it('shows dates in the sheet while preserving second precision for the picker', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 14));
    renderSheet();

    expect(document.querySelector('[data-chart-custom-range-sheet]')?.textContent).toContain('2026-09-19');
    expect(document.querySelector('[data-chart-custom-range-sheet]')?.textContent).not.toContain('00:00:00');
    const start = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '2026-09-19');
    act(() => start?.click());
    expect(document.body.textContent).toContain('选择开始时间');
  });

  it('keeps the header and calendar scrollable while actions stay in a fixed footer', () => {
    renderSheet();

    const sheet = document.querySelector<HTMLElement>('[data-chart-custom-range-sheet]');
    const scrollSurface = document.querySelector<HTMLElement>('[data-chart-custom-range-content]');
    const footer = sheet?.querySelector('footer');

    expect(sheet).not.toBe(scrollSurface);
    expect(scrollSurface?.className).toContain('overflow-y-auto');
    expect(sheet?.querySelector('header')).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(footer?.parentElement).toBe(sheet);
  });

  it('opens the month panel and disables future months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 14));
    renderSheet();

    const caption = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '2026年9月');
    act(() => caption?.click());
    const futureMonth = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '10月');
    expect(futureMonth?.disabled).toBe(true);
  });

  it('disables days after today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 14));
    renderSheet();

    const futureDay = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.getAttribute('aria-label')?.includes('9月20日'));
    expect(futureDay?.disabled).toBe(true);
  });

  it('disables apply for a reversed precise range', () => {
    renderSheet({ range: range('2026-09-19T18:00:00', '2026-09-19T10:00:00') });

    const apply = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '查看统计');
    expect(apply?.disabled).toBe(true);
    expect(document.body.textContent).toContain('开始时间不能晚于结束时间');
  });

  it('reselects a range with full-day defaults and applies the precise values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 14));
    const { onApply } = renderSheet();
    const reset = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '重新选择');
    act(() => reset?.click());
    const day = (value: string) => [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.getAttribute('aria-label')?.includes(`9月${value}日`));
    act(() => day('10')?.click());
    act(() => day('15')?.click());
    const apply = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '查看统计');
    act(() => apply?.click());

    expect(onApply).toHaveBeenCalledWith({ endDate: '2026-09-15T23:59:59', startDate: '2026-09-10T00:00:00' });
  });
});
