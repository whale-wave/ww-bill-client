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
});
