import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCalendarDragDirection, RecordCalendarPresentation } from '@/entities/record';

let cleanup: (() => void) | undefined;
const calendarToggleLabels = {
  collapseCalendarLabel: 'Collapse calendar',
  expandCalendarLabel: 'Expand month',
};

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record calendar presentation', () => {
  function dispatchPointer(
    element: Element,
    type: 'pointerdown' | 'pointerup',
    clientX: number,
    clientY: number,
  ) {
    element.dispatchEvent(new MouseEvent(type, {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
    }));
  }

  it('owns the default calendar, selected-day list and Tailwind descendant styles', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [
        { date: '2026-06-30', income: '6.00' },
        { date: '2026-07-30', expense: '8.00', income: '12.00' },
        { date: '2026-08-03', expense: '18.00' },
      ],
      emptyLabel: 'Empty',
      groups: [{
        dateLabel: '2026年07月30日',
        key: '2026-07-30',
        records: [{ amount: '-8.00', iconName: 'food', id: 1, primary: 'Lunch' }],
      }],
      month: dayjs('2026-07-01'),
      onBack: vi.fn(),
      onCreate: vi.fn(),
      onDateChange: vi.fn(),
      onMonthClick: vi.fn(),
      onToday: vi.fn(),
      recordCountLabel: count => `共 ${count} 笔`,
      selectedDate: dayjs('2026-07-30'),
      state: 'ready',
      todayLabel: 'Today',
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-calendar-carousel]')).not.toBeNull();
    expect(container.querySelectorAll('[data-record-calendar-month]')).toHaveLength(3);
    expect(container.querySelector('[data-record-calendar-month="2026-06"]')).not.toBeNull();
    expect(container.querySelector('[data-record-calendar-month="2026-08"]')).not.toBeNull();
    expect(container.querySelector('[data-record-calendar-month="2026-06"] [data-date="2026-06-30"]')?.textContent)
      .toContain('+6.00');
    expect(container.querySelector('[data-record-calendar-month="2026-08"] [data-date="2026-08-03"]')?.textContent)
      .toContain('-18.00');
    expect(container.querySelector('[data-record-calendar-scroll]')?.className).toContain('overflow-y-auto');
    const selectedDate = container.querySelector('[data-record-calendar-current="true"] [data-date="2026-07-30"]');
    expect(selectedDate).not.toBeNull();
    expect(selectedDate?.className).toContain('justify-center');
    expect(selectedDate?.querySelector('[data-calendar-day-number]')?.className).not.toContain('rounded-full');
    const list = container.querySelector('[data-testid="record-overview-list"]');
    const listContainer = container.querySelector('[data-record-calendar-list]');
    const recordCard = container.querySelector('[data-record-id="1"]')?.parentElement;
    expect(list?.getAttribute('data-record-list-variant')).toBe('overview');
    expect(listContainer?.classList).not.toContain('bg-white/58');
    expect(recordCard?.classList).toContain('rounded-[20px]');
    expect(container.querySelector('[data-record-calendar-create]')).not.toBeNull();
    expect(container.querySelector('[data-record-calendar-today]')).not.toBeNull();
    expect(container.textContent).not.toContain('2026.07.30');
    expect(container.textContent).toContain('共 1 笔');
  });

  it('hides the today action when today is already selected', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const today = dayjs();
    act(() => root.render(createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [],
      emptyLabel: 'Empty',
      groups: [],
      month: today.startOf('month'),
      onBack: vi.fn(),
      onDateChange: vi.fn(),
      onMonthClick: vi.fn(),
      onToday: vi.fn(),
      selectedDate: today,
      state: 'ready',
      todayLabel: 'Today',
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-calendar-today]')).toBeNull();
    expect(container.querySelector('[data-record-calendar-today-placeholder]')).not.toBeNull();
    expect(container.querySelector('[data-record-calendar-list]')?.classList).toContain('ww-surface--content');
    expect(container.querySelector('[data-empty-state-variant="quiet"]')).not.toBeNull();
  });

  it('collapses the calendar to the selected week and swipes by week', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onDateChange = vi.fn();
    const onMonthChange = vi.fn();
    const render = (selectedDate: dayjs.Dayjs) => createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [],
      emptyLabel: 'Empty',
      groups: [],
      month: dayjs('2026-07-01'),
      onBack: vi.fn(),
      onDateChange,
      onMonthChange,
      onToday: vi.fn(),
      selectedDate,
      state: 'ready',
      todayLabel: 'Today',
    });
    act(() => root.render(render(dayjs('2026-07-14'))));
    cleanup = () => act(() => root.unmount());

    const calendar = container.querySelector('[data-record-calendar-current="true"]');
    const toggle = container.querySelector<HTMLButtonElement>('[data-calendar-collapse-toggle]');
    expect(calendar?.querySelectorAll('tbody tr:not([hidden])').length).toBeGreaterThan(1);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');

    act(() => toggle?.click());

    const collapsedCalendar = container.querySelector('[data-calendar-collapsed="true"] [data-record-calendar-current="true"]');
    expect(collapsedCalendar).toBe(calendar);
    expect(container.querySelectorAll('[data-record-calendar-current="true"]')).toHaveLength(1);
    expect(collapsedCalendar?.querySelectorAll('tbody tr:not([hidden])')).toHaveLength(1);
    expect(collapsedCalendar?.querySelector('[data-date="2026-07-14"]')).not.toBeNull();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.className).toContain('h-11');

    const swipeArea = container.querySelector('[data-record-calendar-swipe]');
    act(() => {
      dispatchPointer(swipeArea!, 'pointerdown', 260, 100);
      dispatchPointer(swipeArea!, 'pointerup', 150, 100);
    });
    expect(onDateChange.mock.calls[0]?.[0].format('YYYY-MM-DD')).toBe('2026-07-21');
    expect(onMonthChange).not.toHaveBeenCalled();

    act(() => root.render(render(dayjs('2026-07-28'))));
    onDateChange.mockClear();
    act(() => {
      dispatchPointer(swipeArea!, 'pointerdown', 260, 100);
      dispatchPointer(swipeArea!, 'pointerup', 150, 100);
    });
    expect(onMonthChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-08');
    expect(onDateChange.mock.calls[0]?.[0].format('YYYY-MM-DD')).toBe('2026-08-04');
  });

  it('switches months with intentional horizontal swipes on the calendar', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onDateChange = vi.fn();
    const onMonthChange = vi.fn();
    const render = (month: dayjs.Dayjs) => createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [],
      emptyLabel: 'Empty',
      groups: [],
      month,
      onBack: vi.fn(),
      onDateChange,
      onMonthChange,
      onToday: vi.fn(),
      selectedDate: month,
      state: 'ready',
      todayLabel: 'Today',
    });
    act(() => root.render(render(dayjs('2026-07-01'))));
    cleanup = () => act(() => root.unmount());

    let calendar = container.querySelector('[data-record-calendar-swipe]');
    expect(calendar?.className).toContain('touch-pan-y');
    expect(container.querySelector('[data-record-calendar-month="2026-07"]')).not.toBeNull();
    const monthDetails = container.querySelector('[data-record-calendar-month-details="2026-07"]');
    expect(monthDetails).not.toBeNull();

    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 260, 100);
      dispatchPointer(calendar!, 'pointerup', 150, 108);
    });
    expect(onMonthChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-08');

    const date = container.querySelector('[data-record-calendar-current="true"] [data-date="2026-07-02"]');
    act(() => date?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    expect(onDateChange).not.toHaveBeenCalled();
    act(() => date?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    expect(onDateChange).toHaveBeenCalledOnce();

    act(() => root.render(render(dayjs('2026-08-01'))));
    expect(container.querySelector('[data-record-calendar-current="true"]')
      ?.getAttribute('data-record-calendar-month')).toBe('2026-08');
    expect(container.querySelector('[data-record-calendar-month-details="2026-08"]')).toBe(monthDetails);
    calendar = container.querySelector('[data-record-calendar-swipe]');
    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 120, 100);
      dispatchPointer(calendar!, 'pointerup', 230, 92);
    });
    expect(onMonthChange.mock.calls[1]?.[0].format('YYYY-MM')).toBe('2026-07');
    act(() => root.render(render(dayjs('2026-07-01'))));
    expect(container.querySelector('[data-record-calendar-current="true"]')
      ?.getAttribute('data-record-calendar-month')).toBe('2026-07');
  });

  it('switches to an adjacent month when its dimmed date is selected', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onDateChange = vi.fn();
    const onMonthChange = vi.fn();
    act(() => root.render(createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [{ date: '2026-06-30', income: '6.00' }],
      emptyLabel: 'Empty',
      groups: [],
      month: dayjs('2026-07-01'),
      onBack: vi.fn(),
      onDateChange,
      onMonthChange,
      onToday: vi.fn(),
      selectedDate: dayjs('2026-07-14'),
      state: 'ready',
      todayLabel: 'Today',
    })));
    cleanup = () => act(() => root.unmount());

    const adjacentDate = container.querySelector<HTMLButtonElement>(
      '[data-record-calendar-current="true"] [data-date="2026-06-30"]',
    );
    expect(adjacentDate).not.toBeNull();
    expect(adjacentDate?.disabled).toBe(false);

    act(() => adjacentDate?.click());

    expect(onMonthChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-06');
    expect(onDateChange.mock.calls[0]?.[0].format('YYYY-MM-DD')).toBe('2026-06-30');
  });

  it('ignores vertical, short and future-month swipes', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onMonthChange = vi.fn();
    const render = (month: dayjs.Dayjs) => createElement(RecordCalendarPresentation, {
      ...calendarToggleLabels,
      backLabel: 'Back',
      days: [],
      emptyLabel: 'Empty',
      groups: [],
      month,
      onBack: vi.fn(),
      onDateChange: vi.fn(),
      onMonthChange,
      onToday: vi.fn(),
      selectedDate: month,
      state: 'ready' as const,
      todayLabel: 'Today',
    });
    act(() => root.render(render(dayjs('2026-07-01'))));
    cleanup = () => act(() => root.unmount());

    let calendar = container.querySelector('[data-record-calendar-swipe]');
    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 200, 80);
      dispatchPointer(calendar!, 'pointerup', 140, 190);
      dispatchPointer(calendar!, 'pointerdown', 200, 80);
      dispatchPointer(calendar!, 'pointerup', 165, 82);
    });
    expect(onMonthChange).not.toHaveBeenCalled();

    act(() => root.render(render(dayjs().startOf('month'))));
    calendar = container.querySelector('[data-record-calendar-swipe]');
    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 260, 100);
      dispatchPointer(calendar!, 'pointerup', 150, 100);
    });
    expect(onMonthChange).not.toHaveBeenCalled();
  });
});

describe('calendar drag direction', () => {
  it('changes month for deliberate distance or velocity and otherwise springs back', () => {
    expect(getCalendarDragDirection({ offsetX: -60, offsetY: 0, velocityX: 0, velocityY: 0 })).toBe(1);
    expect(getCalendarDragDirection({ offsetX: 60, offsetY: 0, velocityX: 0, velocityY: 0 })).toBe(-1);
    expect(getCalendarDragDirection({ offsetX: -20, offsetY: 0, velocityX: -600, velocityY: 0 })).toBe(1);
    expect(getCalendarDragDirection({ offsetX: 20, offsetY: 0, velocityX: 600, velocityY: 0 })).toBe(-1);
    expect(getCalendarDragDirection({ offsetX: 30, offsetY: 0, velocityX: 300, velocityY: 0 })).toBe(0);
  });

  it('keeps vertical scroll gestures from changing the month', () => {
    expect(getCalendarDragDirection({ offsetX: -60, offsetY: 100, velocityX: 0, velocityY: 0 })).toBe(0);
    expect(getCalendarDragDirection({
      offsetX: -20,
      offsetY: 100,
      velocityX: -600,
      velocityY: -900,
    })).toBe(0);
  });
});
