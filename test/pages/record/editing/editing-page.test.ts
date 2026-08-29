import type { ReactNode } from 'react';
import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EditingPage from '@/pages/record/editing/EditingPage';

const { location, navigate, queryResult } = vi.hoisted(() => ({
  location: { state: undefined as unknown },
  navigate: vi.fn(),
  queryResult: {
    data: undefined as RecordEntry | undefined,
    isError: false,
    isLoading: true,
  },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => location,
  useNavigate: () => navigate,
  useParams: () => ({ id: 'record-7' }),
}));

vi.mock('@/entities/record', () => ({
  readPersonalRecordDetailNavigationState: (value: unknown) => {
    if (typeof value !== 'object' || value === null || !('personalRecordDetail' in value))
      return undefined;
    const detail = value.personalRecordDetail;
    return typeof detail === 'object'
      && detail !== null
      && 'returnTo' in detail
      && detail.returnTo === 'personal-home'
      ? value
      : undefined;
  },
  RecordDetailPresentation: ({ category, footerActions, onBack, pinnedAction, rows, supplementaryContent }: {
    category: { name: string };
    footerActions?: Array<{ label: string; onClick: () => void }>;
    onBack: () => void;
    pinnedAction?: { label: string; onClick: () => void };
    rows: Array<{ label: string; value: string }>;
    supplementaryContent?: ReactNode;
  }) => createElement('div', { 'data-testid': 'record-detail' }, [
    createElement('button', { 'data-testid': 'record-detail-back', 'key': 'back', 'onClick': onBack, 'type': 'button' }, 'Back'),
    createElement('span', { key: 'content' }, [
      category.name,
      ...rows.map(row => `${row.label}:${row.value}`),
      pinnedAction?.label,
      ...footerActions?.map(action => action.label) ?? [],
    ].filter(Boolean).join('|')),
    ...(footerActions?.map(action => createElement('button', {
      'data-testid': `record-detail-${action.label}`,
      'key': action.label,
      'onClick': action.onClick,
      'type': 'button',
    }, action.label)) ?? []),
    supplementaryContent && createElement('div', { 'data-testid': 'supplementary-content', 'key': 'supplementary-content' }),
    pinnedAction && createElement('button', { 'data-testid': 'record-detail-share', 'key': 'share', 'onClick': pinnedAction.onClick, 'type': 'button' }, pinnedAction.label),
  ]),
  useDeleteRecordMutation: () => [() => Promise.resolve({}), { isLoading: false }],
  useGetRecordByIdQuery: () => queryResult,
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('antd-mobile', () => ({
  ErrorBlock: ({ title }: { title: string }) => createElement('div', { 'data-testid': 'error' }, title),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  location.state = undefined;
  navigate.mockReset();
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
  expect(container.querySelector('[data-testid="record-detail"]')).toBeNull();
}

describe('record editing page', () => {
  it('shows loading without rendering record detail children', () => {
    queryResult.data = undefined;
    queryResult.isError = false;
    queryResult.isLoading = true;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="editing-loading"]')).not.toBeNull();
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

  it('adapts the loaded personal record to the default detail presentation with edit/delete actions', () => {
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
      version: 3,
    };
    queryResult.data = record;
    queryResult.isError = false;
    queryResult.isLoading = false;

    const { container } = renderPage();

    const detail = container.querySelector('[data-testid="record-detail"]');
    expect(detail?.textContent).toContain('餐饮');
    expect(detail?.textContent).toContain('edit.type:record:type.expense');
    expect(detail?.textContent).not.toContain('edit.share');
    expect(detail?.textContent).toContain('record:detail.edit');
    expect(detail?.textContent).toContain('record:detail.delete');

    expect(container.querySelector('[data-testid="record-detail-share"]')).toBeNull();
  });

  it('does not pass an empty attachment section to the detail card', () => {
    queryResult.data = {
      amount: '20.00',
      category: {
        createdAt: '2026-07-16T00:00:00.000Z',
        icon: 'food',
        id: 1,
        name: '餐饮',
        updatedAt: '2026-07-16T00:00:00.000Z',
      },
      createdAt: '2026-07-16T12:30:00.000Z',
      id: 10,
      remark: '午餐',
      time: '2026-07-16T12:30:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-16T12:30:00.000Z',
      version: 1,
      attachments: [],
    };
    queryResult.isError = false;
    queryResult.isLoading = false;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="supplementary-content"]')).toBeNull();
  });

  it('keeps the persisted-record back destination in the personal adapter', () => {
    queryResult.data = {
      amount: '12.00',
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
      status: true,
      time: '2026-07-16T12:30:00.000Z',
      type: 'sub',
      updatedAt: '2026-07-16T12:30:00.000Z',
      version: 3,
    };
    queryResult.isLoading = false;

    const { container } = renderPage();
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-detail-back"]')?.click());

    expect(navigate).toHaveBeenCalledWith('/detail');
  });

  it('returns a shortcut-created record to the personal homepage after its data reloads', () => {
    queryResult.data = {
      amount: '12.00',
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
      version: 3,
    };
    queryResult.isLoading = false;
    location.state = { personalRecordDetail: { returnTo: 'personal-home' } };

    const { container } = renderPage();
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-detail-back"]')?.click());

    expect(navigate).toHaveBeenCalledWith('/detail', { replace: true });
  });

  it('keeps the shortcut return target when opening the record editor', () => {
    queryResult.data = {
      amount: '12.00',
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
      version: 3,
    };
    queryResult.isLoading = false;
    location.state = { personalRecordDetail: { returnTo: 'personal-home' } };

    const { container } = renderPage();
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-detail-record:detail.edit"]')?.click());

    expect(navigate).toHaveBeenCalledWith('/bookkeeping', {
      replace: true,
      state: expect.objectContaining({
        personalRecordDetail: { returnTo: 'personal-home' },
      }),
    });
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
      version: 3,
    };
    location.state = record;
    queryResult.data = undefined;
    queryResult.isError = false;
    queryResult.isLoading = true;

    const { container, rerender } = renderPage();

    expect(container.querySelector('[data-testid="record-detail"]')?.textContent).toContain('晚餐');
    expect(container.querySelector('[data-testid="editing-loading"]')).toBeNull();

    queryResult.isError = true;
    queryResult.isLoading = false;
    rerender();

    expect(container.querySelector('[data-testid="record-detail"]')?.textContent).toContain('晚餐');
    expect(container.querySelector('[data-testid="error"]')).toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="record-detail-back"]')?.click());
    expect(navigate).toHaveBeenCalledWith(-1);
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

  it('rejects route state without the version required by record actions', () => {
    location.state = {
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
    queryResult.data = undefined;
    queryResult.isError = true;
    queryResult.isLoading = false;

    const { container } = renderPage();

    expect(container.querySelector('[data-testid="error"]')).not.toBeNull();
    expectNoDetails(container);
    expect(navigate).not.toHaveBeenCalled();
  });
});
