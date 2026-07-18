import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EditingPage from '@/pages/record/editing/EditingPage';

const { location, queryResult } = vi.hoisted(() => ({
  location: { state: undefined as unknown },
  queryResult: {
    data: undefined as RecordEntry | undefined,
    isError: false,
    isLoading: true,
  },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => location,
  useParams: () => ({ id: 'record-7' }),
}));

vi.mock('@/entities/record', () => ({
  useGetRecordByIdQuery: () => queryResult,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('antd-mobile', () => ({
  ErrorBlock: ({ title }: { title: string }) => createElement('div', { 'data-testid': 'error' }, title),
  SpinLoading: () => createElement('div', { 'data-testid': 'loading' }),
}));

vi.mock('@/pages/record/editing/Top', () => ({
  default: ({ state }: { state?: RecordEntry }) => createElement('div', { 'data-testid': 'top' }, state?.id),
}));

vi.mock('@/pages/record/editing/list', () => ({
  default: ({ state }: { state?: RecordEntry }) => createElement('div', { 'data-testid': 'list' }, state?.id),
}));

vi.mock('@/pages/record/editing/footer', () => ({
  default: ({ state }: { state?: RecordEntry }) => createElement('div', { 'data-testid': 'footer' }, state?.id),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  location.state = undefined;
});

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  const rerender = () => act(() => root.render(createElement(EditingPage)));
  rerender();
  cleanup = () => act(() => root.unmount());
  return { container, rerender };
}

function expectNoDetails(container: HTMLElement) {
  expect(container.querySelector('[data-testid="top"]')).toBeNull();
  expect(container.querySelector('[data-testid="list"]')).toBeNull();
  expect(container.querySelector('[data-testid="footer"]')).toBeNull();
}

describe('record editing page', () => {
  it('shows loading without rendering record detail children', () => {
    queryResult.data = undefined;
    queryResult.isError = false;
    queryResult.isLoading = true;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
    expectNoDetails(container);
  });

  it('shows the load failure without rendering record detail children', () => {
    queryResult.data = undefined;
    queryResult.isError = true;
    queryResult.isLoading = false;

    const { container } = renderPage();

    expect(container.textContent).toContain('common:error.loadFail');
    expectNoDetails(container);
  });

  it('renders all record detail children after the record loads', () => {
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
    queryResult.data = record;
    queryResult.isError = false;
    queryResult.isLoading = false;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="top"]')?.textContent).toBe('7');
    expect(container.querySelector('[data-testid="list"]')?.textContent).toBe('7');
    expect(container.querySelector('[data-testid="footer"]')?.textContent).toBe('7');
  });

  it('renders a valid route-state record through loading and refresh errors', () => {
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
      id: 9,
      remark: '晚餐',
      time: '2026-07-16T12:30:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-16T12:30:00.000Z',
    };
    location.state = record;
    queryResult.data = undefined;
    queryResult.isError = false;
    queryResult.isLoading = true;

    const { container, rerender } = renderPage();

    expect(container.querySelector('[data-testid="top"]')?.textContent).toBe('9');
    expect(container.querySelector('[data-testid="loading"]')).toBeNull();

    queryResult.isError = true;
    queryResult.isLoading = false;
    rerender();

    expect(container.querySelector('[data-testid="top"]')?.textContent).toBe('9');
    expect(container.querySelector('[data-testid="error"]')).toBeNull();
  });

  it('rejects malformed route state before rendering record detail children', () => {
    location.state = {
      amount: '88.00',
      category: null,
      id: 9,
    };
    queryResult.data = undefined;
    queryResult.isError = true;
    queryResult.isLoading = false;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="error"]')).not.toBeNull();
    expectNoDetails(container);
  });
});
