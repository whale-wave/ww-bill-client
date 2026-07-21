import type { ReactNode } from 'react';
import type { Ledger, LedgerTemplate } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import LedgerCenterPage from '@/pages/ledger-center/LedgerCenterPage';
import LedgerCreatePage from '@/pages/ledger-create/LedgerCreatePage';
import LedgerDetailPage from '@/pages/ledger-detail/LedgerDetailPage';
import LedgerTemplatesPage from '@/pages/ledger-templates/LedgerTemplatesPage';

const hooks = vi.hoisted(() => ({
  createLedger: vi.fn(),
  refetchLedgers: vi.fn(),
  refetchTemplates: vi.fn(),
  useCreateLedgerMutation: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerTemplatesQuery: vi.fn(),
  useLedgersQuery: vi.fn(),
}));

const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/ledger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/ledger')>();
  return {
    ...actual,
    useCreateLedgerMutation: hooks.useCreateLedgerMutation,
    useLedgerQuery: hooks.useLedgerQuery,
    useLedgerTemplatesQuery: hooks.useLedgerTemplatesQuery,
    useLedgersQuery: hooks.useLedgersQuery,
  };
});

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  return {
    ...actual,
    Toast: { show: toastShow },
  };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) => options?.name
      ? `${key}:${options.name}`
      : key,
  }),
}));

const templates: LedgerTemplate[] = [
  {
    categoryProfileKey: 'business-v1',
    defaultName: '生意账本',
    description: '经营收支专用账本',
    iconKey: 'shop',
    key: 'business',
    name: '生意账本',
    themeKey: 'green',
    version: 1,
  },
  {
    categoryProfileKey: 'reimbursement-v1',
    defaultName: '报销账本',
    description: '记录报销账目',
    iconKey: 'receipt',
    key: 'reimbursement',
    name: '报销账本',
    themeKey: 'blue',
    version: 1,
  },
  {
    categoryProfileKey: 'company-v1',
    defaultName: '公司账本',
    description: '公司采购管理',
    iconKey: 'company',
    key: 'company',
    name: '公司账本',
    themeKey: 'blue',
    version: 1,
  },
  {
    categoryProfileKey: 'team-v1',
    defaultName: '团队账本',
    description: '团队经费专属',
    iconKey: 'team',
    key: 'team',
    name: '团队账本',
    themeKey: 'orange',
    version: 1,
  },
  {
    categoryProfileKey: 'micro-business-v1',
    defaultName: '微商账本',
    description: '代购卖货账目',
    iconKey: 'micro-business',
    key: 'micro-business',
    name: '微商账本',
    themeKey: 'cyan',
    version: 1,
  },
  {
    categoryProfileKey: 'custom-v1',
    defaultName: '自定义账本',
    description: '自定义专属账本',
    iconKey: 'custom',
    key: 'custom',
    name: '自定义账本',
    themeKey: 'gray',
    version: 1,
  },
];

const ledger: Ledger = {
  capabilities: [],
  createdAt: '2026-07-21T00:00:00.000Z',
  createdByUserId: 1,
  iconKey: 'shop',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '生意账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  templateKey: 'business',
  templateVersion: 1,
  themeKey: 'green',
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const pagePath = pathname.split('?')[0];
  const pageRoutePath = pagePath.startsWith('/ledgers/')
    && pagePath !== '/ledgers/templates'
    && pagePath !== '/ledgers/create'
    ? '/ledgers/:ledgerId'
    : pagePath;
  const routes = [
    { path: pageRoutePath, element },
    ...(pagePath === '/ledgers/templates'
      ? []
      : [{ path: '/ledgers/templates', element: createElement('div', null, 'templates-target') }]),
    ...(pagePath === '/ledgers/create'
      ? []
      : [{ path: '/ledgers/create', element: createElement('div', null, 'create-target') }]),
    ...(pageRoutePath === '/ledgers/:ledgerId'
      ? []
      : [{ path: '/ledgers/:ledgerId', element: createElement('div', null, 'detail-target') }]),
  ];
  const router = createMemoryRouter(routes, { initialEntries: [pathname] });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

function successfulQuery<T>(data: T) {
  return {
    data,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  toastShow.mockReset();
  hooks.useLedgersQuery.mockReturnValue(successfulQuery([ledger]));
  hooks.useLedgerTemplatesQuery.mockReturnValue(successfulQuery(templates));
  hooks.useLedgerQuery.mockReturnValue(successfulQuery(ledger));
  hooks.useCreateLedgerMutation.mockReturnValue([
    hooks.createLedger,
    { isLoading: false },
  ]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger center page', () => {
  it('opens the URL-scoped ledger detail when a card is clicked', async () => {
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));

    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    expect(card).not.toBeNull();
    await act(async () => card?.click());

    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa');
  });

  it('renders the error state and retries the list query', async () => {
    hooks.useLedgersQuery.mockReturnValue({
      data: [],
      isError: true,
      isLoading: false,
      refetch: hooks.refetchLedgers,
    });
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));

    expect(container.textContent).toContain('center.loadError');
    const retry = container.querySelector<HTMLButtonElement>('[data-testid="ledger-center-retry"]');
    await act(async () => retry?.click());

    expect(hooks.refetchLedgers).toHaveBeenCalledOnce();
  });
});

describe('ledger template page', () => {
  it('renders all six API templates and carries the selected key in the URL', async () => {
    const { container, router } = renderPage('/ledgers/templates', createElement(LedgerTemplatesPage));

    expect(container.querySelectorAll('[data-template-key]')).toHaveLength(6);
    const card = container.querySelector<HTMLButtonElement>('[data-template-key="business"]');
    await act(async () => card?.click());

    expect(router.state.location).toMatchObject({
      pathname: '/ledgers/create',
      search: '?template=business',
    });
  });
});

describe('ledger detail page', () => {
  it('uses the decoded ledger id from the URL as the query authority', () => {
    const { container } = renderPage(
      '/ledgers/ledger%2Fa',
      createElement(LedgerDetailPage),
    );

    expect(hooks.useLedgerQuery).toHaveBeenCalledWith({
      params: { ledgerId: 'ledger/a' },
      queryOptions: { enabled: true },
    });
    expect(container.textContent).toContain('detail.module.records');
    expect(container.textContent).toContain('detail.comingSoon');
    expect(container.querySelector('[data-testid="ledger-members"]')).toBeNull();
  });

  it('shows only collaboration entries granted by server capabilities', () => {
    hooks.useLedgerQuery.mockReturnValue(successfulQuery({
      ...ledger,
      capabilities: [
        LedgerCapability.MEMBER_READ,
        LedgerCapability.MEMBER_REVIEW,
      ],
    }));
    const { container } = renderPage(
      '/ledgers/ledger%2Fa',
      createElement(LedgerDetailPage),
    );

    expect(container.querySelector('[data-testid="ledger-members"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-requests"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-invite"]')).toBeNull();
  });
});

describe('ledger create page', () => {
  it('prevents duplicate submissions and replaces the form with the created detail', async () => {
    let resolveCreate: ((value: { data: Ledger; message: string; statusCode: number }) => void) | undefined;
    hooks.createLedger.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    const { container, router } = renderPage(
      '/ledgers/create?template=business',
      createElement(LedgerCreatePage),
    );
    const submit = container.querySelector<HTMLButtonElement>('button[type="submit"]');
    const form = container.querySelector<HTMLFormElement>('form');

    expect(submit).not.toBeNull();
    expect(form).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(hooks.createLedger).toHaveBeenCalledOnce();
    expect(hooks.createLedger).toHaveBeenCalledWith({
      monthStartDay: 1,
      name: '生意账本',
      templateKey: 'business',
      templateVersion: 1,
    });

    await act(async () => {
      resolveCreate?.({
        data: { ...ledger, id: 'created/ledger' },
        message: '成功',
        statusCode: 201,
      });
      await Promise.resolve();
    });

    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    expect(router.state.location.pathname).toBe('/ledgers/created%2Fledger');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('keeps the form open and displays the business error message', async () => {
    hooks.createLedger.mockRejectedValue(new Error('账本名称已存在'));
    const { container, router } = renderPage(
      '/ledgers/create?template=business',
      createElement(LedgerCreatePage),
    );
    const submit = container.querySelector<HTMLButtonElement>('button[type="submit"]');
    const form = container.querySelector<HTMLFormElement>('form');

    expect(submit).not.toBeNull();
    expect(form).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({
      content: '账本名称已存在',
      icon: 'fail',
    }));
    expect(router.state.location.pathname).toBe('/ledgers/create');
  });
});
