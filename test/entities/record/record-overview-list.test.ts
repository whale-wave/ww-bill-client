import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordOverviewList, toRecordSearchGroups } from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function render(variant?: 'overview' | 'search', onDelete?: () => void, onRecordClick?: () => void) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(RecordOverviewList, {
    groups: [{
      dateLabel: '2026年07月21日',
      key: '2026-07-21',
      records: [{
        amount: '-20.00',
        originalAmount: '-100.00',
        hasAttachment: true,
        iconName: 'food',
        id: 7,
        onClick: onRecordClick,
        overviewSecondary: '#聚餐',
        primary: 'Dinner',
        rightActions: onDelete
          ? [{ color: 'danger', key: 'delete', onClick: onDelete, text: 'Delete' }]
          : undefined,
        secondary: 'Avan · Shared',
      }],
      summaries: [{ key: 'expense', label: 'Expense', value: '20.00' }],
    }],
    variant,
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('record overview list', () => {
  it('maps calendar metadata for both search and overview list styles', () => {
    const [group] = toRecordSearchGroups([{
      amount: '20.00',
      attachments: [{
        byteSize: 100,
        contentHash: 'hash',
        createdAt: '2026-07-21T12:00:00.000Z',
        height: 100,
        id: 'attachment-1',
        mimeType: 'image/webp',
        sortOrder: 0,
        type: 'IMAGE',
        width: 100,
      }],
      category: {
        createdAt: '2026-07-01T00:00:00.000Z',
        icon: 'food',
        id: 1,
        name: '餐饮',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
      createdAt: '2026-07-21T12:00:00.000Z',
      id: 7,
      remark: 'Dinner',
      tags: [{ id: 'tag-1', name: '聚餐' }],
      time: '2026-07-21T12:00:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-21T12:00:00.000Z',
      version: 1,
    }], {
      expenseLabel: 'Expense',
      incomeLabel: 'Income',
      showCategoryAsSecondary: true,
    });

    expect(group?.records[0]).toMatchObject({
      hasAttachment: true,
      overviewSecondary: '餐饮 · #聚餐',
      secondary: '餐饮 · #聚餐',
    });
  });

  it('does not expose persisted floating-point tails in record amounts or daily totals', () => {
    const [group] = toRecordSearchGroups([{
      amount: '2.7000000000000006',
      category: {
        createdAt: '2026-07-01T00:00:00.000Z',
        icon: 'car',
        id: 1,
        name: '交通',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
      createdAt: '2026-07-21T12:00:00.000Z',
      id: 8,
      remark: '充电',
      time: '2026-07-21T12:00:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-21T12:00:00.000Z',
      version: 1,
    }], {
      expenseLabel: 'Expense',
      incomeLabel: 'Income',
    });

    expect(group?.records[0]?.amount).toBe('-2.7');
    expect(group?.summaries).toEqual([
      { key: 'expense', label: 'Expense', value: '2.7' },
    ]);
  });

  it('uses the original record search geometry by default', () => {
    const container = render();
    const list = container.querySelector('[data-testid="record-overview-list"]');
    const row = container.querySelector('[data-record-id="7"]');
    const iconCell = row?.querySelector('[data-category-icon="food"]');

    expect(list?.getAttribute('data-record-list-variant')).toBe('search');
    expect(row?.classList).toContain('h-[59px]');
    expect(iconCell?.classList).toContain('mx-4');
    expect(iconCell?.classList).toContain('py-3');
  });

  it('uses a compact but readable card row for overview pages', () => {
    const container = render('overview');
    const list = container.querySelector('[data-testid="record-overview-list"]');
    const row = container.querySelector('[data-record-id="7"]');
    const card = row?.parentElement;
    const content = row?.querySelector('[data-record-content]');
    const amount = row?.querySelector('[data-record-amount]');

    expect(list?.getAttribute('data-record-list-variant')).toBe('overview');
    expect(row?.classList).toContain('min-h-[68px]');
    expect(card?.classList).toContain('rounded-[20px]');
    expect(card?.parentElement?.classList).toContain('pt-1.5');
    expect(content?.classList).toContain('gap-[13px]');
    expect(content?.classList).toContain('px-[18px]');
    expect(amount?.classList).toContain('text-[15px]');
    expect(amount?.classList).toContain('leading-[22.5px]');
    expect(row?.textContent).toContain('#聚餐');
    expect(row?.querySelector('[aria-label="含图片"]')).not.toBeNull();
    expect(row?.querySelector('del')?.textContent).toContain('100.00');
  });

  it('wraps configured actions in a swipe control without turning the action into row navigation', () => {
    const onDelete = vi.fn();
    const onRecordClick = vi.fn();
    const container = render('overview', onDelete, onRecordClick);

    const action = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Delete');
    expect(container.querySelector('.adm-swipe-action')).not.toBeNull();
    expect(container.querySelector('.ww-record-swipe-action')).not.toBeNull();
    expect(action).toBeDefined();

    act(() => action?.click());
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onRecordClick).not.toHaveBeenCalled();
  });
});
