import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overviewDemoAssets, overviewDemoGroups } from '@/pages/asset/asset-chart/model/asset-overview-demo';
import { AssetSankeyCard } from '@/pages/asset/asset-chart/ui/AssetSankey';
import { changeLanguage } from '@/shared/i18n';

const chart = vi.hoisted(() => ({ resize: vi.fn(), setOption: vi.fn() }));
vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: chart }),
}));

let cleanup: (() => void) | undefined;

function renderCard(props: Partial<Parameters<typeof AssetSankeyCard>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(AssetSankeyCard, {
    assets: overviewDemoAssets,
    groups: overviewDemoGroups,
    ...props,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

function latestSeries(): { data: Array<{ name: string; label: { formatter: () => string } }> } {
  return chart.setOption.mock.calls.at(-1)?.[0].series[0];
}

beforeEach(async () => {
  await changeLanguage('zh-CN');
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  chart.setOption.mockClear();
  chart.resize.mockClear();
  vi.unstubAllGlobals();
});

describe('asset overview display', () => {
  it('hides every amount in metrics, canvas labels and tooltips', () => {
    const container = renderCard();
    expect(container.querySelectorAll('dd[aria-label]')).toHaveLength(3);
    const button = Array.from(container.querySelectorAll('button')).find(item => item.textContent === '隐藏金额');
    act(() => button?.click());
    expect(container.querySelectorAll('dd[aria-label]')).toHaveLength(0);
    expect(Array.from(container.querySelectorAll('dd')).every(item => item.textContent === '••••')).toBe(true);
    const series = latestSeries();
    const node = series.data?.find(item => item.name === 'net');
    const formatter = node?.label?.formatter;
    expect(formatter?.()).toBe('净资产');
    const tooltipFormatter = chart.setOption.mock.calls.at(-1)?.[0].tooltip.formatter;
    expect(tooltipFormatter({ name: 'net' })).toBe('净资产\n');
  });

  it('uses percentages of the whole diagram rather than each local category', () => {
    const container = renderCard();
    const button = Array.from(container.querySelectorAll('button')).find(item => item.textContent === '比例');
    act(() => button?.click());
    const node = latestSeries().data?.find(item => item.name === 'net');
    const formatter = node?.label?.formatter;
    expect(formatter?.()).toBe('净资产\n56.5%');
  });

  it('shows the zero-balance empty state and hides the graph', () => {
    const container = renderCard({ assets: [] });
    expect(container.textContent).toContain('暂无非零余额');
    expect(container.querySelector<HTMLElement>('.asset-sankey__scroll')?.hidden).toBe(true);
  });

  it('shows a retry action for an initial load failure', () => {
    const onRetry = vi.fn();
    const container = renderCard({ assets: [], isError: true, onRetry });
    expect(container.textContent).toContain('资产账户加载失败');
    act(() => container.querySelector<HTMLButtonElement>('.asset-sankey__state button')?.click());
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
