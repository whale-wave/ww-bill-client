import type { ReactNode } from 'react';
import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import List from '@/pages/record/editing/list';

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  FixedPin: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) =>
    createElement('button', { onClick, type: 'button' }, children),
}));

const record: RecordEntry = {
  amount: '88.00',
  category: {
    createdAt: '2026-07-16T00:00:00.000Z',
    icon: 'food',
    id: 1,
    name: '餐饮',
    updatedAt: '2026-07-16T00:00:00.000Z',
  },
  createdAt: '2026-07-16T12:30:00.000Z',
  id: 7,
  remark: '午餐',
  time: '2026-07-16T12:30:00.000Z',
  type: 'sub',
  updatedAt: '2026-07-16T12:30:00.000Z',
};

let cleanup: (() => void) | undefined;

beforeEach(() => {
  navigate.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record editing details', () => {
  it('opens the share page with the current record', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(List, { state: record })));
    cleanup = () => act(() => root.unmount());

    const shareButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === 'edit.share');

    expect(shareButton).toBeDefined();
    act(() => shareButton?.click());

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/share', {
      state: { record },
    });
  });
});
