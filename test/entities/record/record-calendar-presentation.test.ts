import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordCalendarPresentation } from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record calendar presentation', () => {
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
    expect(container.querySelector('[data-record-calendar-list]')?.classList).toContain('bg-white/58');
  });
});
