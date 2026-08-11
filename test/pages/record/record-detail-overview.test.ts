import type { recordChildren } from '@/entities/record';
import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DetailList from '@/pages/record/detail/List';

const hooks = vi.hoisted(() => ({
  useRecordList: vi.fn(),
}));

vi.mock('@/pages/record/model/useRecordList', () => ({
  useRecordList: hooks.useRecordList,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function renderList() {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(
    MemoryRouter,
    null,
    createElement(DetailList, {
      change: vi.fn(),
      selectTime: dayjs('2026-07-01'),
    }),
  )));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  hooks.useRecordList.mockReset();
});

describe('personal record detail overview', () => {
  it('keeps the original detail-list row semantics when adapting record groups', () => {
    const record = {
      amount: '20.00',
      category: {
        createdAt: '2026-07-01T00:00:00.000Z',
        icon: 'catering',
        id: 1,
        name: '餐饮',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
      createdAt: '2026-07-21T12:00:00.000Z',
      id: 7,
      remark: '晚餐',
      time: '2026-07-21T12:00:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-21T12:00:00.000Z',
      version: 1,
    } satisfies recordChildren;
    hooks.useRecordList.mockReturnValue({
      record: [['07月21日', '星期一', 1, [record], 20, 0]],
    });

    const container = renderList();
    const recordRow = container.querySelector('[data-record-id="7"]');
    const amount = recordRow?.lastElementChild?.lastElementChild;

    expect(container.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(container.querySelector('[data-date-group="07月21日-星期一"]')?.textContent).toContain('晚餐');
    expect(recordRow?.tagName).toBe('DIV');
    expect(container.querySelector('[data-record-list-variant]')?.getAttribute('data-record-list-variant')).toBe('overview');
    expect(recordRow?.classList).toContain('h-[66px]');
    expect(amount?.textContent).toBe('-20');
    expect(amount?.className).toContain('text-rose-500');
    expect(container.querySelector('[data-category-icon="catering"] use')?.getAttribute('xlink:href')).toBe('#icon-catering');
  });
});
