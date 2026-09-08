import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCalendarDragDirection, RecordCalendarPresentation } from '@/entities/record';

let cleanup: (() => void) | undefined;

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
      backLabel: 'Back',
      days: [{ date: '2026-07-30', expense: '8.00', income: '12.00' }],
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

    const page = container.querySelector('[data-record-calendar-presentation]');
    expect(page?.className).toContain('[&_.adm-calendar-picker-view-title]:hidden');
    expect(page?.className).toContain('[&_.adm-calendar-picker-view-cell]:min-h-0');
    expect(page?.className).toContain('[&_.adm-calendar-picker-view-cell-selected]:!border-primary-mid');
    expect(page?.className).toContain('[&_.adm-calendar-picker-view-cell-selected]:!bg-transparent');
    expect(container.querySelector('[data-record-calendar-scroll]')?.className).toContain('overflow-y-auto');
    expect(container.querySelector('[data-date="2026-07-30"]')).not.toBeNull();
    expect(container.querySelector('[data-date="2026-07-30"]')?.className).toContain('-translate-y-px');
    expect(container.querySelector('[data-date="2026-07-30"]')?.className).toContain('justify-center');
    expect(container.querySelector('[data-date="2026-07-30"] [data-calendar-day-number]')?.className).not.toContain('rounded-full');
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

  it('switches months with intentional horizontal swipes on the calendar', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onDateChange = vi.fn();
    const onMonthChange = vi.fn();
    const render = (month: dayjs.Dayjs) => createElement(RecordCalendarPresentation, {
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
    expect(container.querySelector('[data-record-calendar-month-details="2026-07"]')).not.toBeNull();

    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 260, 100);
      dispatchPointer(calendar!, 'pointerup', 150, 108);
    });
    expect(onMonthChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-08');

    const date = container.querySelector('[data-date="2026-07-02"]');
    act(() => date?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    expect(onDateChange).not.toHaveBeenCalled();
    act(() => date?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    expect(onDateChange).toHaveBeenCalledOnce();

    act(() => root.render(render(dayjs('2026-08-01'))));
    const animatedMonth = container.querySelector('[data-record-calendar-month="2026-08"]');
    expect(animatedMonth?.getAttribute('data-month-transition-direction')).toBe('forward');
    calendar = container.querySelector('[data-record-calendar-swipe]');
    act(() => {
      dispatchPointer(calendar!, 'pointerdown', 120, 100);
      dispatchPointer(calendar!, 'pointerup', 230, 92);
    });
    expect(onMonthChange.mock.calls[1]?.[0].format('YYYY-MM')).toBe('2026-07');
    act(() => root.render(render(dayjs('2026-07-01'))));
    expect(container.querySelector('[data-record-calendar-month="2026-07"]')
      ?.getAttribute('data-month-transition-direction')).toBe('backward');
  });

  it('ignores vertical, short and future-month swipes', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onMonthChange = vi.fn();
    const render = (month: dayjs.Dayjs) => createElement(RecordCalendarPresentation, {
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
