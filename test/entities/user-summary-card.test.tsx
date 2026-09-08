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

  it('renders automatic check-in guidance without a manual action', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(UserSummaryCard, {
      checkIn: false,
      name: 'Tester',
      numberInfo: { checkInAll: 2, checkInKeep: 1, recordCount: 3 },
      onProfileClick: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.textContent).toContain('checkIn.automaticHint');
    expect(Array.from(container.querySelectorAll('button')).some(button => button.textContent?.includes('checkIn.automaticHint'))).toBe(false);
  });
});
