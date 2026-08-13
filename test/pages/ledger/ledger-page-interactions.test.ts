import type { ReactNode } from 'react';
import type { Ledger, LedgerListItem, LedgerTemplate } from '@/entities/ledger';
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
  archiveLedger: vi.fn(),
  leaveLedger: vi.fn(),
  reorderLedgers: vi.fn(),
  refetchManagement: vi.fn(),
  refetchLedgers: vi.fn(),
  refetchTemplates: vi.fn(),
  useArchiveLedgerMutation: vi.fn(),
  useCreateLedgerMutation: vi.fn(),
  useLeaveLedgerMutation: vi.fn(),
  useLedgerManagementQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerTemplatesQuery: vi.fn(),
  useLedgersQuery: vi.fn(),
  useReorderLedgersMutation: vi.fn(),
}));

const toastShow = vi.hoisted(() => vi.fn());
const dialogConfirm = vi.hoisted(() => vi.fn());

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

vi.mock('@/entities/ledger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/ledger')>();
  return {
    ...actual,
    useArchiveLedgerMutation: hooks.useArchiveLedgerMutation,
    useCreateLedgerMutation: hooks.useCreateLedgerMutation,
    useLeaveLedgerMutation: hooks.useLeaveLedgerMutation,
    useLedgerManagementQuery: hooks.useLedgerManagementQuery,
    useLedgerQuery: hooks.useLedgerQuery,
    useLedgerTemplatesQuery: hooks.useLedgerTemplatesQuery,
    useLedgersQuery: hooks.useLedgersQuery,
    useReorderLedgersMutation: hooks.useReorderLedgersMutation,
  };
});

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  return {
    ...actual,
    Dialog: { confirm: dialogConfirm },
    Toast: { show: toastShow },
  };
});

vi.mock('@/pages/ledger-center/ui/SortableLedgerGrid', async () => {
  const { createElement, useRef } = await import('react');
  return {
    SortableLedgerGrid: ({
      ledgers,
      onOrderChange,
      onRemove,
    }: {
      ledgers: LedgerListItem[];
      onOrderChange: (next: LedgerListItem[]) => void;
      onRemove: (ledger: LedgerListItem) => void;
    }) => {
      const activeIndexRef = useRef<number>();
      const overIndexRef = useRef<number>();
      return createElement(
        'div',
        {
          'aria-label': '账本排序',
          'className': 'ledger-management-grid',
          'data-columns': '2',
          'data-sort-mode': 'true',
          'data-testid': 'ledger-management-grid',
          'role': 'list',
        },
        ledgers.map((item, index) => createElement(
          'div',
          { key: item.id, role: 'listitem' },
          createElement(
            'button',
            {
              'aria-label': `${item.name}，可排序`,
              'data-ledger-id': item.id,
              'data-ledger-status': item.status,
              'onKeyDown': (event: KeyboardEvent) => {
                if (event.key === ' ') {
                  event.preventDefault();
                  if (activeIndexRef.current === undefined) {
                    activeIndexRef.current = index;
                    overIndexRef.current = index;
                    return;
                  }
                  const from = activeIndexRef.current;
                  const to = overIndexRef.current ?? from;
                  activeIndexRef.current = undefined;
                  overIndexRef.current = undefined;
                  if (from === to)
                    return;
                  const next = [...ledgers];
                  const [moved] = next.splice(from, 1);
                  if (moved)
                    next.splice(to, 0, moved);
                  onOrderChange(next);
                  return;
                }
                if (event.key === 'Escape') {
                  activeIndexRef.current = undefined;
                  overIndexRef.current = undefined;
                  return;
                }
                if (activeIndexRef.current === undefined)
                  return;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                  overIndexRef.current = Math.min(ledgers.length - 1, (overIndexRef.current ?? index) + 1);
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                  overIndexRef.current = Math.max(0, (overIndexRef.current ?? index) - 1);
              },
              'type': 'button',
            },
            item.name,
          ),
          createElement(
            'button',
            {
              'aria-label': `${item.myRole === LedgerRole.OWNER ? '归档' : '退出'} ${item.name}`,
              'data-testid': 'ledger-remove-badge',
              'disabled': item.status === LedgerStatus.SUSPENDED,
              'onClick': () => onRemove(item),
              'type': 'button',
            },
            '移除',
          ),
        )),
      );
    },
  };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { action?: string; name?: string }) => {
      const translations: Record<string, string> = {
        'center.archive': '归档',
        'center.continueSorting': '继续排序',
        'center.create': '创建账本',
        'center.customEmpty': '还没有自建或加入的账本',
        'center.customEmptyDescription': '创建新账本，或通过邀请码加入他人账本。',
        'center.discard': '放弃',
        'center.discardSortDescription': '当前排序尚未保存，离开后更改会丢失。',
        'center.discardSortTitle': '放弃排序？',
        'center.join': '加入他人账本',
        'center.listUpdated': '账本列表已更新，请重新排序',
        'center.loadError': '账本加载失败',
        'center.loadErrorDescription': '请检查网络后重试。',
        'center.loading': '正在加载账本',
        'center.quickSettings': '账本快捷设置',
        'center.retry': '重新加载',
        'center.saveOrder': '保存排序',
        'center.sortHint': '拖动账本可修改排序',
        'center.subtitle': '整理、排序与创建你的账本',
        'center.suspended': '账本已被平台暂停，暂不能归档或退出',
        'center.title': '我的账本',
        'center.leave': '退出',
        'common:nav.back': '返回',
        'common:nav.cancel': '取消',
        'common.listSeparator': '，',
        'center.sortable': '可排序',
        'center.suspendedShort': '已暂停',
        'template.business.name': '生意账本',
      };
      if (key === 'center.removeTitle')
        return `${options?.action}“${options?.name}”？`;
      if (key === 'center.archiveSuccess')
        return `已归档${options?.name}`;
      if (key === 'center.leaveSuccess')
        return `已退出${options?.name}`;
      if (key === 'center.sharedMemberCount')
        return `${(options as { count?: number })?.count ?? 0} 人共享`;
      if (key === 'center.memberCount')
        return `共 ${(options as { count?: number })?.count ?? 0} 人`;
      return translations[key] ?? key;
    },
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

function managementLedger(
  id: string,
  name: string,
  overrides: Partial<LedgerListItem> = {},
): LedgerListItem {
  return {
    ...ledger,
    activeMemberCount: 1,
    id,
    myMembership: {
      id: `membership/${id}`,
      sortOrder: 0,
      version: 7,
    },
    name,
    recordCount: 0,
    ...overrides,
  };
}

const managementLedgers = [
  managementLedger('ledger/a', '报销账本', {
    activeMemberCount: 2,
    myMembership: { id: 'membership/a', sortOrder: 0, version: 11 },
    version: 5,
  }),
  managementLedger('ledger/b', '生意账本', {
    myMembership: { id: 'membership/b', sortOrder: 1, version: 12 },
    myRole: LedgerRole.BOOKKEEPER,
    version: 6,
  }),
  managementLedger('ledger/c', '旅行账本', {
    myMembership: { id: 'membership/c', sortOrder: 2, version: 13 },
    version: 7,
  }),
];

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const pagePath = pathname.split('?')[0];
  const staticLedgerPaths = [
    '/ledgers/templates',
    '/ledgers/create',
    '/ledgers/join',
    '/ledgers/preferences',
  ];
  const pageRoutePath = pagePath.startsWith('/ledgers/')
    && !staticLedgerPaths.includes(pagePath)
    ? '/ledgers/:ledgerId'
    : pagePath;
  const routes = [
    { path: pageRoutePath, element },
    { path: '/origin', element: createElement('div', null, 'origin-target') },
    ...(pagePath === '/ledgers/templates'
      ? []
      : [{ path: '/ledgers/templates', element: createElement('div', null, 'templates-target') }]),
    ...(pagePath === '/ledgers/create'
      ? []
      : [{ path: '/ledgers/create', element: createElement('div', null, 'create-target') }]),
    ...(pageRoutePath === '/ledgers/:ledgerId'
      ? []
      : [{ path: '/ledgers/:ledgerId', element: createElement('div', null, 'detail-target') }]),
    { path: '/ledgers/:ledgerId/records', element: createElement('div', null, 'records-target') },
    { path: '/ledgers/:ledgerId/bill', element: createElement('div', null, 'bill-target') },
    { path: '/ledgers/preferences', element: createElement('div', null, 'preferences-target') },
    { path: '/ledgers/join', element: createElement('div', null, 'join-target') },
  ];
  const router = createMemoryRouter(routes, {
    initialEntries: ['/origin', pathname],
    initialIndex: 1,
  });

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
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
  hooks.useLedgerManagementQuery.mockReturnValue(successfulQuery(managementLedgers));
  hooks.useLedgersQuery.mockReturnValue(successfulQuery([ledger]));
  hooks.useLedgerTemplatesQuery.mockReturnValue(successfulQuery(templates));
  hooks.useLedgerQuery.mockReturnValue(successfulQuery(ledger));
  hooks.useCreateLedgerMutation.mockReturnValue([
    hooks.createLedger,
    { isLoading: false },
  ]);
  hooks.useReorderLedgersMutation.mockReturnValue([
    hooks.reorderLedgers,
    { isLoading: false },
  ]);
  hooks.useArchiveLedgerMutation.mockReturnValue([
    hooks.archiveLedger,
    { isLoading: false },
  ]);
  hooks.useLeaveLedgerMutation.mockReturnValue([
    hooks.leaveLedger,
    { isLoading: false },
  ]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger center page', () => {
  it('uses the management endpoint, excludes system defaults, and renders a semantic three-column grid', () => {
    hooks.useLedgerManagementQuery.mockReturnValue(successfulQuery([
      managementLedger('default/system', '不应出现', {
        kind: LedgerKind.SYSTEM_DEFAULT,
      }),
      ...managementLedgers,
    ]));

    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));

    expect(hooks.useLedgerManagementQuery).toHaveBeenCalled();
    expect(hooks.useLedgersQuery).not.toHaveBeenCalled();
    expect(container.querySelector('[data-ledger-id="default/system"]')).toBeNull();
    const grid = container.querySelector('[data-testid="ledger-management-grid"]');
    expect(grid?.getAttribute('role')).toBe('list');
    expect(grid?.getAttribute('data-columns')).toBe('2');
    expect(grid?.querySelectorAll('[role="listitem"]')).toHaveLength(3);
    expect(container.textContent).toContain('共 2 人');
    expect(container.querySelector('[data-ledger-id="ledger/a"]')?.getAttribute('aria-label'))
      .toContain('2 人共享');
    expect(container.querySelector('.ledger-cover-card__currency')).not.toBeNull();
    expect(container.querySelectorAll('.ledger-cover-card__motif svg').length).toBeGreaterThan(0);
  });

  it('opens the records workspace when a card is clicked and opens preferences from settings', async () => {
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));

    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    expect(card).not.toBeNull();
    await act(async () => card?.click());

    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records');

    router.navigate('/ledgers');
    await act(async () => Promise.resolve());
    const settings = container.querySelector<HTMLButtonElement>('[aria-label="账本快捷设置"]');
    expect(settings?.classList.contains('rounded-full')).toBe(true);
    await act(async () => settings?.click());
    expect(router.state.location.pathname).toBe('/ledgers/preferences');
  });

  it('keeps a dirty sort draft behind one blocker dialog for settings navigation', async () => {
    dialogConfirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    const settings = container.querySelector<HTMLButtonElement>('[aria-label="账本快捷设置"]');
    await act(async () => settings?.click());
    expect(dialogConfirm).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/ledgers');

    await act(async () => settings?.click());
    expect(dialogConfirm).toHaveBeenCalledTimes(2);
    expect(router.state.location.pathname).toBe('/ledgers/preferences');
  });

  it.each(['/ledgers/templates', '/ledgers/join'])(
    'blocks dirty programmatic navigation to %s',
    async (target) => {
      dialogConfirm.mockResolvedValue(false);
      const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));
      const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
      await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
      const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
      await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
      await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
      await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

      await act(async () => router.navigate(target));

      expect(dialogConfirm).toHaveBeenCalledTimes(1);
      expect(router.state.location.pathname).toBe('/ledgers');
    },
  );

  it('blocks dirty history navigation and proceeds only after confirmation', async () => {
    dialogConfirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    await act(async () => router.navigate(-1));
    expect(dialogConfirm).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/ledgers');

    await act(async () => router.navigate(-1));
    expect(dialogConfirm).toHaveBeenCalledTimes(2);
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('does not stack blocker dialogs when another navigation starts while confirming', async () => {
    const confirmation = createDeferred<boolean>();
    dialogConfirm.mockReturnValue(confirmation.promise);
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    const settings = container.querySelector<HTMLButtonElement>('[aria-label="账本快捷设置"]');
    await act(async () => {
      settings?.click();
      await Promise.resolve();
    });
    await act(async () => {
      void router.navigate('/ledgers/join');
      await Promise.resolve();
    });
    expect(dialogConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      confirmation.resolve(false);
      await confirmation.promise;
    });
    expect(router.state.location.pathname).toBe('/ledgers');
  });

  it('registers a beforeunload guard only while the sort draft is dirty', async () => {
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });

  it('enters sort mode with a long press while Enter still opens records and Space enters sorting', async () => {
    vi.useFakeTimers();
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const firstCard = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');

    await act(async () => {
      firstCard?.dispatchEvent(new MouseEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      }));
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector('[data-sort-mode="true"]')).not.toBeNull();
    vi.useRealTimers();

    cleanup?.();
    cleanup = undefined;
    const second = renderPage('/ledgers', createElement(LedgerCenterPage));
    const enterCard = second.container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => {
      enterCard?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    });
    expect(second.router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records');

    await act(async () => second.router.navigate('/ledgers'));
    const spaceCard = second.container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => {
      spaceCard?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    });
    expect(second.container.querySelector('[data-sort-mode="true"]')).not.toBeNull();
  });

  it('arms long press only for the primary pointer and tolerates about eight pixels of movement', async () => {
    vi.useFakeTimers();
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    let card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');

    await act(async () => {
      card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 2, clientX: 10, clientY: 10 }));
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector('[data-sort-mode="true"]')).toBeNull();

    await act(async () => {
      card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
      card?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 16, clientY: 14 }));
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector('[data-sort-mode="true"]')).not.toBeNull();

    cleanup?.();
    cleanup = undefined;
    const moved = renderPage('/ledgers', createElement(LedgerCenterPage));
    card = moved.container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => {
      card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
      card?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 19, clientY: 10 }));
      vi.advanceTimersByTime(500);
    });
    expect(moved.container.querySelector('[data-sort-mode="true"]')).toBeNull();
    vi.useRealTimers();
  });

  it('keeps reorder as a local draft and saves every ledger id and membership version in display order', async () => {
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => {
      card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    });

    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    expect(hooks.reorderLedgers).not.toHaveBeenCalled();
    const grid = container.querySelector('[data-testid="ledger-management-grid"]');
    expect(Array.from(grid?.querySelectorAll('[data-ledger-id]') ?? []).map(node => node.getAttribute('data-ledger-id')))
      .toEqual(['ledger/b', 'ledger/a', 'ledger/c']);

    const save = container.querySelector<HTMLButtonElement>('[data-testid="ledger-order-save"]');
    await act(async () => save?.click());
    expect(hooks.reorderLedgers).toHaveBeenCalledWith({
      items: [
        { ledgerId: 'ledger/b', memberVersion: 12 },
        { ledgerId: 'ledger/a', memberVersion: 11 },
        { ledgerId: 'ledger/c', memberVersion: 13 },
      ],
    });
  });

  it('asks before discarding a dirty reorder draft on back', async () => {
    dialogConfirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { container, router } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const sortable = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight', key: 'ArrowRight' })));
    await act(async () => sortable?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' })));

    const back = container.querySelector<HTMLButtonElement>('[data-page-header] button[aria-label="返回"]');
    await act(async () => back?.click());
    expect(dialogConfirm).toHaveBeenCalledWith(expect.objectContaining({ title: '放弃排序？' }));
    expect(router.state.location.pathname).toBe('/ledgers');

    await act(async () => back?.click());
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('archives owners with ledger version and leaves as a member with membership version', async () => {
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));

    const archive = container.querySelector<HTMLButtonElement>('[aria-label="归档 报销账本"]');
    const leave = container.querySelector<HTMLButtonElement>('[aria-label="退出 生意账本"]');
    expect(archive).not.toBeNull();
    expect(leave).not.toBeNull();

    await act(async () => archive?.click());
    expect(hooks.archiveLedger).toHaveBeenCalledWith({
      data: { confirmed: true, version: 5 },
      ledgerId: 'ledger/a',
    });

    await act(async () => leave?.click());
    expect(hooks.leaveLedger).toHaveBeenCalledWith({
      ledgerId: 'ledger/b',
      version: 12,
    });
  });

  it('explains suspended ledgers and disables every destructive action', async () => {
    hooks.useLedgerManagementQuery.mockReturnValue(successfulQuery(managementLedgers.map(item => ({
      ...item,
      status: LedgerStatus.SUSPENDED,
    }))));
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    expect(container.querySelector('.ledger-center-suspended-note')).not.toBeNull();
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));

    expect(container.querySelectorAll('[data-ledger-status="SUSPENDED"]')).toHaveLength(3);
    expect(container.querySelectorAll('.ledger-center-suspended-note')).toHaveLength(1);
    expect(container.textContent).toContain('账本已被平台暂停，暂不能归档或退出');
    expect(container.querySelectorAll<HTMLButtonElement>('[data-testid="ledger-remove-badge"]:disabled')).toHaveLength(3);
    expect(hooks.archiveLedger).not.toHaveBeenCalled();
    expect(hooks.leaveLedger).not.toHaveBeenCalled();
  });

  it('refreshes management data and clears the draft after a 409 reorder conflict', async () => {
    hooks.reorderLedgers.mockRejectedValue({ statusCode: 409 });
    hooks.useLedgerManagementQuery.mockReturnValue({
      ...successfulQuery(managementLedgers),
      refetch: hooks.refetchManagement,
    });
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));
    const card = container.querySelector<HTMLButtonElement>('[data-ledger-id="ledger/a"]');
    await act(async () => card?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })));
    const save = container.querySelector<HTMLButtonElement>('[data-testid="ledger-order-save"]');

    await act(async () => save?.click());

    expect(hooks.refetchManagement).toHaveBeenCalledOnce();
    expect(container.querySelector('[data-sort-mode="true"]')).toBeNull();
    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({ content: '账本列表已更新，请重新排序' }));
  });

  it('renders the error state and retries the list query', async () => {
    hooks.useLedgerManagementQuery.mockReturnValue({
      data: [],
      isError: true,
      isLoading: false,
      refetch: hooks.refetchLedgers,
    });
    const { container } = renderPage('/ledgers', createElement(LedgerCenterPage));

    expect(container.textContent).toContain('账本加载失败');
    const retry = container.querySelector<HTMLButtonElement>('[data-testid="ledger-center-retry"]');
    await act(async () => retry?.click());

    expect(hooks.refetchLedgers).toHaveBeenCalledOnce();
  });

  it('renders loading and an empty state with create and join actions', async () => {
    hooks.useLedgerManagementQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: true,
      refetch: hooks.refetchManagement,
    });
    const loading = renderPage('/ledgers', createElement(LedgerCenterPage));
    expect(loading.container.querySelector('[data-testid="ledger-center-loading"]')).not.toBeNull();

    cleanup?.();
    cleanup = undefined;
    hooks.useLedgerManagementQuery.mockReturnValue(successfulQuery([]));
    const empty = renderPage('/ledgers', createElement(LedgerCenterPage));
    expect(empty.container.textContent).toContain('还没有自建或加入的账本');
    expect(empty.container.querySelector('[data-testid="ledger-create"]')).toBeNull();

    const create = empty.container.querySelector<HTMLButtonElement>('[data-testid="ledger-empty-create"]');
    const join = empty.container.querySelector<HTMLButtonElement>('[data-testid="ledger-empty-join"]');
    expect(create).not.toBeNull();
    expect(join).not.toBeNull();

    await act(async () => join?.click());
    expect(empty.router.state.location.pathname).toBe('/ledgers/join');
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
    expect(container.textContent).toContain('detail.module.bill');
    expect(container.querySelector('[data-module-key="bill"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(container.textContent).toContain('detail.comingSoon');
    expect(container.querySelector('[data-testid="ledger-members"]')).toBeNull();
  });

  it('opens the scoped bill from the ledger module list when record read is allowed', async () => {
    hooks.useLedgerQuery.mockReturnValue(successfulQuery({
      ...ledger,
      capabilities: [LedgerCapability.RECORD_READ],
    }));
    const { container, router } = renderPage(
      '/ledgers/ledger%2Fa',
      createElement(LedgerDetailPage),
    );

    await act(async () => container.querySelector<HTMLElement>('[data-module-key="bill"]')?.click());
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/bill');
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
    expect(router.state.location.pathname).toBe('/ledgers/created%2Fledger/records');
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
