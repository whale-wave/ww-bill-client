import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserSummaryCard } from '@/entities/user';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('userSummaryCard', () => {
  it('renders zero for every missing statistic', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: false,
      name: 'Tester',
      numberInfo: {},
      onProfileClick: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    const metricValues = Array.from(container.querySelectorAll('dd > span:first-child'));
    expect(metricValues.map(value => value.textContent)).toEqual(['0', '0', '0']);
  });

  it('renders one completed label without a manual action', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: true,
      name: 'Tester',
      numberInfo: { checkInAll: 2, checkInKeep: 1, recordCount: 3 },
      onProfileClick: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.textContent).toContain('checkIn.completed');
    expect(Array.from(container.querySelectorAll('button')).some(button => button.textContent?.includes('checkIn.completed'))).toBe(false);
  });

  it('shows completion immediately, then restores the action if check-in fails', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onCheckIn = vi.fn();
    cleanup = () => act(() => root.unmount());

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: false,
      name: 'Tester',
      numberInfo: {},
      onCheckIn,
      onProfileClick: vi.fn(),
    })));
    const button = Array.from(container.querySelectorAll('button'))
      .find(candidate => candidate.textContent?.includes('checkIn.action'));
    expect(button).toBeDefined();
    act(() => button?.click());
    expect(onCheckIn).toHaveBeenCalledTimes(1);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: true,
      isCheckingIn: true,
      name: 'Tester',
      numberInfo: {},
      onCheckIn,
      onProfileClick: vi.fn(),
    })));
    expect(container.textContent).toContain('checkIn.completed');
    expect(container.textContent).not.toContain('checkIn.checking');
    expect(Array.from(container.querySelectorAll('button')).some(candidate => candidate.textContent?.includes('checkIn.action'))).toBe(false);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: true,
      name: 'Tester',
      numberInfo: {},
      onCheckIn,
      onProfileClick: vi.fn(),
    })));
    expect(container.textContent).toContain('checkIn.completed');
    expect(container.textContent).not.toContain('checkIn.action');

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: false,
      name: 'Tester',
      numberInfo: {},
      onCheckIn,
      onProfileClick: vi.fn(),
    })));
    expect(container.textContent).toContain('checkIn.action');
  });
});
