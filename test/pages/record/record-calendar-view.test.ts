import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecordCalendarPage from '@/pages/record/record-calendar/RecordCalendarPage';

const hooks = vi.hoisted(() => ({
  useRecordCalendar: vi.fn(),
}));

vi.mock('@/pages/record/model/useRecordCalendar', () => ({
  useRecordCalendar: hooks.useRecordCalendar,
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('personal record calendar', () => {
  it('shows income and expense amounts inside a date cell', () => {
    const selectedDate = dayjs('2026-07-15');
    hooks.useRecordCalendar.mockReturnValue({
      calendarRange: {
        max: selectedDate.endOf('month').toDate(),
        min: selectedDate.startOf('month').toDate(),
      },
      dateMap: new Map([
        [selectedDate.startOf('day').valueOf(), { expend: 23, income: 100, list: [] }],
      ]),
      getDateText: (date: Date) => dayjs(date).date(),
      isToday: () => false,
      list: { data: [], time: selectedDate.valueOf() },
      onBack: vi.fn(),
      onChangeDate: vi.fn(),
      onDatePicker: vi.fn(),
      onFixedPinClick: vi.fn(),
      onToToday: vi.fn(),
      selectDateValue: selectedDate,
      selectMonthValue: selectedDate.startOf('month'),
    });
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(RecordCalendarPage)));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    const cell = container.querySelector('[data-date="2026-07-15"]');
    expect(cell?.textContent).toContain('+100');
    expect(cell?.textContent).toContain('-23');
  });
});
