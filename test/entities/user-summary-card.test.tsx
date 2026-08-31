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
      onCheckIn: vi.fn(),
      onProfileClick: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    const metricValues = Array.from(container.querySelectorAll('dd > span:first-child'));
    expect(metricValues.map(value => value.textContent)).toEqual(['0', '0', '0']);
  });

  it('disables the check-in button while the request is pending', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: false,
      isCheckInPending: true,
      name: 'Tester',
      numberInfo: { checkInAll: 2, checkInKeep: 1, recordCount: 3 },
      onCheckIn: vi.fn(),
      onProfileClick: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('button[disabled]')?.textContent).toContain('checkIn.button');
  });
});
