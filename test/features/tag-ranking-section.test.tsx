import type { TagRankingResponse } from '@/entities/chart';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { TagRankingSection } from '@/features/chart-overview';

const ranking: TagRankingResponse = {
  items: [
    { amount: '109.20', key: 'aggregate:untagged', name: '无标签', percentage: 78.4, tagId: null },
    { amount: '30.00', key: 'tag-1', name: '大茶壶', percentage: 21.6, tagId: 'tag-1' },
  ],
  totalAmount: '139.20',
};

describe('tag ranking section', () => {
  let root: ReturnType<typeof createRoot> | undefined;

  afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
  });

  function render(props: React.ComponentProps<typeof TagRankingSection>) {
    const container = document.createElement('div');
    root = createRoot(container);
    act(() => root?.render(createElement(TagRankingSection, props)));
    return container;
  }

  it('keeps the reference layout while tag ranking is loading', () => {
    const container = render({ isLoading: true });

    expect(container.querySelector('[data-tag-ranking-section]')).not.toBeNull();
    expect(container.querySelector('[data-tag-ranking-loading]')).not.toBeNull();
    expect(container.textContent).not.toContain('标签排行加载中');
  });

  it('renders a donut, legend, and progress rows when data is available', () => {
    const container = render({ data: ranking });

    expect(container.querySelector('[aria-label="标签金额占比"]')).not.toBeNull();
    expect(container.querySelector('[data-tag-ranking-donut]')).not.toBeNull();
    expect(container.querySelector('[data-tag-ranking-rows]')).not.toBeNull();
    expect(container.querySelectorAll('[data-tag-ranking-section]')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-primary-mid')).toHaveLength(2);
    expect(container.textContent).toContain('¥139.20');
    expect(container.textContent).toContain('#大茶壶');
  });

  it('shrinks the center amount for a long formatted value', () => {
    const container = render({
      data: {
        items: [{ amount: '1,234,567.89', key: 'tag-1', name: '大茶壶', percentage: 100, tagId: 'tag-1' }],
        totalAmount: '1,234,567.89',
      },
    });

    expect((container.querySelector('[data-tag-ranking-donut] span.font-number') as HTMLElement).style.fontSize).toBe('11px');
  });

  it('keeps unavailable and empty results inside the ranking section', () => {
    const error = render({ isError: true });
    expect(error.querySelector('[data-tag-ranking-state="error"]')).not.toBeNull();
    expect(error.textContent).toContain('标签排行暂不可用');

    act(() => root?.unmount());
    const empty = render({ data: { items: [], totalAmount: '0.00' } });
    expect(empty.querySelector('[data-tag-ranking-state="empty"]')).not.toBeNull();
    expect(empty.textContent).toContain('暂无标签统计');
  });

  it('counts records without tags as the untagged ranking when the response is empty', () => {
    const container = render({
      data: { items: [], totalAmount: '0.00' },
      fallbackRecords: [{ amount: '90.00', tags: [] }],
    });

    expect(container.querySelector('[data-tag-ranking-empty]')).toBeNull();
    expect(container.textContent).toContain('无标签');
    expect(container.textContent).toContain('¥90.00');
  });
});
