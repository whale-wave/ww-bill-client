import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRecordCalendar } from '@/pages/record/model/useRecordCalendar';

const useGetRecordQuery = vi.hoisted(() => vi.fn());

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useGetRecordQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function CalendarControllerProbe() {
  const controller = useRecordCalendar();
  const firstDay = controller.dateMap.values().next().value;
  return createElement(
    'div',
    null,
    createElement(
      'span',
      { 'data-testid': 'selected-date' },
      controller.selectDateValue.format('YYYY-MM-DD'),
    ),
    createElement('span', { 'data-testid': 'first-expense' }, firstDay?.expend),
  );
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record calendar controller', () => {
  it('reads the legacy date key once and replaces it with selectTime', async () => {
    const legacyDate = dayjs('2026-06-15T09:00:00');
    useGetRecordQuery.mockReturnValue({
      data: { data: [], expend: 0, income: 0, total: 0 },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([{
      element: createElement(CalendarControllerProbe),
      path: '/record-calendar',
    }], {
      initialEntries: [`/record-calendar?bookkeeping.selectTime=${legacyDate.valueOf()}`],
    });
    await act(async () => {
      root.render(createElement(RouterProvider, { router }));
      await Promise.resolve();
    });
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-testid="selected-date"]')?.textContent)
      .toBe('2026-06-15');
    expect(router.state.location.search).toBe(`?selectTime=${legacyDate.valueOf()}`);
    expect(useGetRecordQuery).toHaveBeenCalledWith({
      params: { startDate: '2026-06-15' },
    });
  });

  it('keeps daily totals in decimal strings without converting them to Number', async () => {
    useGetRecordQuery.mockReturnValue({
      data: {
        data: [
          {
            amount: '2.7000000000000006',
            category: {
              createdAt: '',
              icon: 'car',
              id: 1,
              name: '交通',
              updatedAt: '',
            },
            createdAt: '',
            id: 8,
            remark: '充电',
            time: '2026-09-08T08:00:00.000+08:00',
            type: 'sub',
            updatedAt: '',
            version: 1,
          },
          {
            amount: '5845.49',
            category: {
              createdAt: '',
              icon: 'bill',
              id: 2,
              name: '其他',
              updatedAt: '',
            },
            createdAt: '',
            id: 9,
            remark: '其他支出',
            time: '2026-09-08T09:00:00.000+08:00',
            type: 'sub',
            updatedAt: '',
            version: 1,
          },
        ],
        expend: 0,
        income: 0,
        total: 1,
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([{
      element: createElement(CalendarControllerProbe),
      path: '/record-calendar',
    }], { initialEntries: ['/record-calendar'] });

    await act(async () => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-testid="first-expense"]')?.textContent)
      .toBe('5848.1900000000000006');
  });
});
