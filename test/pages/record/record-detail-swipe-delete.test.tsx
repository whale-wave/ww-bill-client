import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DetailPage from '@/pages/record/detail/DetailPage';

const mocks = vi.hoisted(() => ({
  confirmDangerousAction: vi.fn(),
  deleteRecord: vi.fn(),
  refetch: vi.fn(),
  useDeleteRecordMutation: vi.fn(),
  useRecordList: vi.fn(),
}));

vi.mock('antd-mobile', async importOriginal => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Toast: { show: vi.fn() },
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useDeleteRecordMutation: mocks.useDeleteRecordMutation,
}));

vi.mock('@/pages/record/detail/Top', () => ({
  useRecordOverviewHeader: () => ({
    metrics: [],
    period: { label: '2026', value: '07' },
    renderTitle: (className: string) => createElement('h1', { className }, '明细'),
    shortcuts: [],
  }),
}));

vi.mock('@/pages/record/model/useRecordList', () => ({
  useRecordList: mocks.useRecordList,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/ui')>()),
  confirmDangerousAction: mocks.confirmDangerousAction,
}));

vi.mock('@/widgets/layout', () => ({
  TabBar: () => createElement('div', { 'data-testid': 'tab-bar' }),
}));

let cleanup: (() => void) | undefined;

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(MemoryRouter, null, createElement(DetailPage))));
  cleanup = () => act(() => root.unmount());
  return container;
}

beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset());
  mocks.deleteRecord.mockResolvedValue({ message: 'deleted', statusCode: 200 });
  mocks.refetch.mockResolvedValue(undefined);
  mocks.useDeleteRecordMutation.mockReturnValue([mocks.deleteRecord, { isLoading: false }]);
  mocks.useRecordList.mockReturnValue({
    amounts: [['20'], ['0']],
    hasData: true,
    isError: false,
    isFetching: false,
    isLoading: false,
    record: [[
      '07月21日',
      '星期一',
      1,
      [{
        amount: '20.00',
        category: { icon: 'catering', id: 1, name: '餐饮' },
        createdAt: '2026-07-21T12:00:00.000Z',
        id: 7,
        remark: '晚餐',
        time: '2026-07-21T12:00:00.000Z',
        type: 'sub',
        updatedAt: '2026-07-21T12:00:00.000Z',
        version: 3,
      }],
      20,
      0,
    ]],
    refetch: mocks.refetch,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('personal record detail swipe delete', () => {
  it('does not delete when the confirmation is dismissed', async () => {
    mocks.confirmDangerousAction.mockResolvedValue(false);
    const container = renderPage();
    const deleteAction = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.textContent === 'detail.delete');

    expect(container.querySelector('.adm-swipe-action')).not.toBeNull();
    await act(async () => deleteAction?.click());

    expect(mocks.deleteRecord).not.toHaveBeenCalled();
  });

  it('deletes the selected record with its current version after confirmation', async () => {
    mocks.confirmDangerousAction.mockResolvedValue(true);
    const container = renderPage();
    const deleteAction = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.textContent === 'detail.delete');

    await act(async () => deleteAction?.click());

    expect(mocks.deleteRecord).toHaveBeenCalledWith({ id: '7', version: 3 });
  });
});
