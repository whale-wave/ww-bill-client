import type { GetChartApiResponseMonthData, GetChartApiResponseWeekData } from '@/entities/chart';
import type { ChartOverviewContextValue, ChartOverviewTab } from '@/features/chart-overview';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ChartOverviewContext,
  ChartOverviewPresentation,
  deriveMonthTabs,
  deriveWeekTabs,
} from '@/features/chart-overview';
import { i18n } from '@/shared/i18n';

const noop = () => undefined;
const renderCleanups: Array<() => void> = [];
const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');

function overviewTab(key: string, name: string): ChartOverviewTab {
  return {
    amount: 0,
    average: '0.00',
    data: [],
    key,
    name,
    ranking: [],
  };
}

function overviewContext(
  overrides: Partial<ChartOverviewContextValue> = {},
): ChartOverviewContextValue {
  return {
    currentAmountType: 'sub',
    currentTimeRangeCategory: 'week',
    setCurrentAmountType: noop,
    setCurrentTimeRangeCategory: noop,
    setTabActive: noop,
    tabActive: '',
    tabs: [],
    ...overrides,
  };
}

function renderOverview(initialValue: ChartOverviewContextValue) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  const render = (value: ChartOverviewContextValue) => {
    act(() => root.render(
      <MemoryRouter>
        <ChartOverviewContext.Provider value={value}>
          <ChartOverviewPresentation />
        </ChartOverviewContext.Provider>
      </MemoryRouter>,
    ));
  };

  render(initialValue);
  renderCleanups.push(() => {
    act(() => root.unmount());
    container.remove();
  });

  return { container, rerender: render };
}

function installAnimationFrameQueue() {
  let frameId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    frameId += 1;
    frames.set(frameId, callback);
    return frameId;
  });
  const cancelAnimationFrame = vi.fn((id: number) => {
    frames.delete(id);
  });

  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);

  return {
    cancelAnimationFrame,
    flush() {
      const queuedFrames = [...frames.entries()];
      frames.clear();
      act(() => queuedFrames.forEach(([, callback]) => callback(0)));
    },
    requestAnimationFrame,
  };
}

function monthYear(year: number, months: number[]): GetChartApiResponseMonthData {
  return {
    amount: 0,
    data: months.map(month => ({
      amount: 0,
      average: '0.00',
      data: [],
      ranking: [],
      type: 'month',
      value: month,
    })),
    type: 'year',
    value: year,
  };
}

function weekYear(year: number, weeks: number[]): GetChartApiResponseWeekData {
  return {
    amount: 0,
    data: weeks.map(week => ({
      amount: 0,
      average: '0.00',
      data: [],
      ranking: [],
      type: 'week',
      value: week,
    })),
    type: 'year',
    value: year,
  };
}

afterEach(() => {
  while (renderCleanups.length)
    renderCleanups.pop()?.();
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
  else
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  vi.useRealTimers();
});

describe('chart overview period metadata', () => {
  it('identifies this and last week by their ISO week-year pair', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 30, 12));

    const tabs = deriveWeekTabs([
      weekYear(2025, [35]),
      weekYear(2026, [34, 35]),
    ]);

    expect(tabs.map(tab => ({ key: tab.key, name: tab.name }))).toEqual([
      {
        key: '2025-35',
        name: i18n.t('chart:tab.yearWeekNumber', { week: 35, year: 2025 }),
      },
      { key: '2026-34', name: i18n.t('chart:tab.lastWeek') },
      { key: '2026-35', name: i18n.t('chart:tab.thisWeek') },
    ]);
  });

  it('identifies last month across the year boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 12));

    const tabs = deriveMonthTabs([
      monthYear(2025, [12]),
      monthYear(2026, [1]),
    ]);

    expect(tabs.map(tab => ({ key: tab.key, name: tab.name }))).toEqual([
      { key: '2025-12', name: i18n.t('chart:tab.lastMonth') },
      { key: '2026-1', name: i18n.t('chart:tab.thisMonth') },
    ]);
  });
});

describe('chart overview period tabs', () => {
  it('reveals the selected period after tabs load asynchronously', () => {
    const animationFrames = installAnimationFrameQueue();
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    const tabs = [
      overviewTab('2026-33', '第33周'),
      overviewTab('2026-34', '上周'),
      overviewTab('2026-35', '本周'),
    ];
    const { container, rerender } = renderOverview(overviewContext());

    expect(animationFrames.requestAnimationFrame).not.toHaveBeenCalled();

    rerender(overviewContext({
      tabActive: tabs[2].key,
      tabs,
    }));

    const selectedPeriod = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '本周');
    const selectedRange = [...container.querySelectorAll<HTMLButtonElement>('.chart-period-tabs > button')]
      .find(button => button.textContent === i18n.t('chart:tabs.week'));

    expect(selectedPeriod?.getAttribute('aria-pressed')).toBe('true');
    expect(selectedRange?.getAttribute('aria-pressed')).toBe('true');
    expect(selectedPeriod?.classList).toContain('snap-center');
    expect(selectedPeriod?.parentElement?.classList).toContain('snap-proximity');
    expect(scrollIntoView).not.toHaveBeenCalled();

    animationFrames.flush();

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView.mock.contexts[0]).toBe(selectedPeriod);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'nearest',
      inline: 'center',
    });
  });

  it('repositions the active period when range, amount, or metric context changes', () => {
    const animationFrames = installAnimationFrameQueue();
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    const activeTab = overviewTab('2026-1', '当前周期');
    const tabs = [activeTab];
    const { container, rerender } = renderOverview(overviewContext({
      currentMetric: 'sub',
      tabActive: activeTab.key,
      tabs,
    }));
    animationFrames.flush();

    rerender(overviewContext({
      currentMetric: 'sub',
      currentTimeRangeCategory: 'month',
      tabActive: activeTab.key,
      tabs,
    }));
    animationFrames.flush();

    rerender(overviewContext({
      currentMetric: 'sub',
      currentTimeRangeCategory: 'year',
      tabActive: activeTab.key,
      tabs,
    }));
    animationFrames.flush();

    rerender(overviewContext({
      currentMetric: 'net',
      currentTimeRangeCategory: 'year',
      tabActive: activeTab.key,
      tabs,
    }));
    animationFrames.flush();

    rerender(overviewContext({
      currentAmountType: 'add',
      currentMetric: 'add',
      currentTimeRangeCategory: 'year',
      tabActive: activeTab.key,
      tabs,
    }));
    animationFrames.flush();

    const ranges = [...container.querySelectorAll<HTMLButtonElement>('.chart-period-tabs > button')];
    expect(ranges.find(button => button.textContent === i18n.t('chart:tabs.year'))?.getAttribute('aria-pressed')).toBe('true');
    expect(ranges.filter(button => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(animationFrames.requestAnimationFrame).toHaveBeenCalledTimes(5);
    expect(scrollIntoView).toHaveBeenCalledTimes(5);
  });

  it('cancels a stale frame and relocates when the available tab keys change', () => {
    const animationFrames = installAnimationFrameQueue();
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    const activeTab = overviewTab('2026-34', '上周');
    const { rerender } = renderOverview(overviewContext({
      tabActive: activeTab.key,
      tabs: [activeTab, overviewTab('2026-33', '第33周')],
    }));

    rerender(overviewContext({
      tabActive: activeTab.key,
      tabs: [activeTab, overviewTab('2026-35', '本周')],
    }));

    expect(animationFrames.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(animationFrames.cancelAnimationFrame).toHaveBeenCalledWith(1);

    animationFrames.flush();

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect((scrollIntoView.mock.contexts[0] as HTMLElement).textContent).toBe('上周');
  });
});
