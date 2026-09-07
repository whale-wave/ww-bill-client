import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordMonthPicker } from '@/entities/record';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
  vi.useRealTimers();
});

function openMonthPicker(month = '2025-07-01') {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-08-10T12:00:00.000Z'));
  const onChange = vi.fn();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(RecordMonthPicker, {
    month: dayjs(month),
    monthLabel: '月',
    onChange,
    testId: 'month-picker',
  })));
  cleanup = () => act(() => root.unmount());
  const open = () => act(() => container.querySelector<HTMLButtonElement>('[data-testid="month-picker"]')?.click());
  open();
  return { onChange, open };
}

function selectYear(year: number) {
  const button = [...document.body.querySelectorAll<HTMLButtonElement>('[data-testid="record-year-options"] button')]
    .find(button => button.textContent === `${year}年`);
  act(() => button?.click());
}

function confirmMonth() {
  act(() => document.body.querySelector<HTMLButtonElement>('[data-testid="record-month-confirm"]')?.click());
}

describe('record month picker', () => {
  it('selects a year and month from the bottom sheet', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T12:00:00.000Z'));
    const onChange = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(createElement(RecordMonthPicker, {
      month: dayjs('2025-07-01'),
      monthLabel: '月',
      onChange,
      testId: 'month-picker',
    })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="month-picker"]')?.click());
    const sheet = document.body.querySelector('[data-testid="month-picker-sheet"]');
    const year = [...document.body.querySelectorAll<HTMLButtonElement>('[data-testid="record-year-options"] button')]
      .find(button => button.textContent === '2026年');
    const month = [...document.body.querySelectorAll<HTMLButtonElement>('[data-testid="record-month-options"] button')]
      .find(button => button.textContent === '8月');

    expect(sheet).not.toBeNull();
    act(() => year?.click());
    act(() => month?.click());

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-08');
  });

  it('selects a year directly from the compact year sheet', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T12:00:00.000Z'));
    const onChange = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(createElement(RecordMonthPicker, {
      month: dayjs('2025-07-01'),
      onChange,
      precision: 'year',
      testId: 'year-picker',
      variant: 'compact',
    })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="year-picker"]')?.click());
    const year = [...document.body.querySelectorAll<HTMLButtonElement>('[data-testid="record-year-options"] button')]
      .find(button => button.textContent === '2026年');

    expect(document.body.querySelector('[data-testid="record-month-options"]')).toBeNull();
    act(() => year?.click());

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].format('YYYY')).toBe('2026');
  });

  it('confirms a changed year without requiring another month selection', () => {
    const { onChange } = openMonthPicker();
    selectYear(2026);
    expect(onChange).not.toHaveBeenCalled();

    confirmMonth();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2026-07');
  });

  it('lets the user confirm the unchanged selected period', () => {
    const { onChange } = openMonthPicker();

    confirmMonth();

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2025-07');
  });

  it('discards the unconfirmed year when closed and reopened', () => {
    const { onChange, open } = openMonthPicker();
    selectYear(2026);
    const close = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '关闭');
    act(() => close?.click());
    expect(onChange).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));

    open();
    confirmMonth();

    expect(onChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2025-07');
  });

  it('blocks confirmation when changing the year would select a future month', () => {
    const { onChange } = openMonthPicker('2025-12-01');
    selectYear(2026);
    const confirm = document.body.querySelector<HTMLButtonElement>('[data-testid="record-month-confirm"]');

    expect(confirm?.disabled).toBe(true);
    expect(document.body.querySelector('[role="status"]')?.textContent).toContain('所选月份尚未到来');
    confirmMonth();
    expect(onChange).not.toHaveBeenCalled();

    selectYear(2025);
    expect(confirm?.disabled).toBe(false);
    confirmMonth();
    expect(onChange.mock.calls[0]?.[0].format('YYYY-MM')).toBe('2025-12');
  });
});
