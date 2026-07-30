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
  return createElement(
    'span',
    { 'data-testid': 'selected-date' },
    controller.selectDateValue.format('YYYY-MM-DD'),
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
});
