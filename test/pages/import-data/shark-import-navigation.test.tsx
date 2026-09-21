import type { LedgerListItem } from '@/entities/ledger';
import type { SharkImportPreview } from '@/entities/record-import';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerCapability, ledgerKeys, LedgerKind, LedgerRole, LedgerStatus } from '@/entities/ledger';
import ImportDataPage from '@/pages/import-data/ImportDataPage';
import SharkImportPreviewPage from '@/pages/import-data/SharkImportPreviewPage';

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  get: vi.fn(),
  save: vi.fn(),
  commit: vi.fn(),
}));

vi.mock('@/entities/record-import', () => ({
  uploadSharkImport: mocks.upload,
  getSharkImport: mocks.get,
  saveSharkImportDraft: mocks.save,
  commitSharkImport: mocks.commit,
}));

const ledgerId = '11111111-1111-4111-8111-111111111111';
const batchId = '22222222-2222-4222-8222-222222222222';
const importPath = `/import-data?ledgerId=${ledgerId}`;
const previewPath = `/import-data/shark/${batchId}?ledgerId=${ledgerId}`;

const ledger: LedgerListItem = {
  id: ledgerId,
  ownerUserId: 1,
  createdByUserId: 1,
  name: '我的账本',
  kind: LedgerKind.SYSTEM_DEFAULT,
  iconKey: 'book',
  themeKey: 'blue',
  monthStartDay: 1,
  status: LedgerStatus.ACTIVE,
  version: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  myRole: LedgerRole.OWNER,
  capabilities: [LedgerCapability.RECORD_CREATE],
  activeMemberCount: 1,
  recordCount: 0,
  myMembership: { id: 'member-1', version: 1, sortOrder: 0 },
};

const preview: SharkImportPreview = {
  id: batchId,
  revision: 1,
  status: 'DRAFT',
  expiresAt: '2026-09-22T00:00:00.000Z',
  assetLinkAllowed: true,
  assets: [],
  rows: [],
  summary: {
    included: 0,
    income: '0',
    expense: '0',
    newCategories: 0,
    newTags: 0,
    problems: 0,
    linked: 0,
    posted: 0,
    linkOnly: 0,
  },
  result: null,
};

let cleanup = () => {};

function renderFlow(startAtPreview = false) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  queryClient.setQueryData(ledgerKeys.list(), { data: [ledger] });
  queryClient.setQueryData(['record-import', 'shark', ledgerId, batchId], preview);
  const router = createMemoryRouter([
    { path: '/source', element: <div>来源页面</div> },
    { path: '/import-data', element: <ImportDataPage /> },
    { path: '/import-data/shark/:batchId', element: <SharkImportPreviewPage /> },
  ], {
    initialEntries: ['/source', startAtPreview ? previewPath : importPath],
    initialIndex: 1,
  });
  act(() => root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  ));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

beforeEach(() => {
  mocks.upload.mockResolvedValue({ id: batchId });
  mocks.get.mockResolvedValue(preview);
});

afterEach(() => {
  cleanup();
  cleanup = () => {};
  vi.clearAllMocks();
});

describe('shark import navigation', () => {
  it('returns through import to the original page after an upload', async () => {
    const { container, router } = renderFlow();
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['data'], 'shark.csv', { type: 'text/csv' })] });
    await act(async () => {
      input?.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(router.state.location.pathname).toBe(`/import-data/shark/${batchId}`);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-page-header] button')?.click();
    });
    expect(router.state.location.pathname).toBe('/import-data');

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-page-header] button')?.click();
    });
    expect(router.state.location.pathname).toBe('/source');
  });

  it('replaces a directly opened preview before returning to its source', async () => {
    const { container, router } = renderFlow(true);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-page-header] button')?.click();
    });
    expect(router.state.location.pathname).toBe('/import-data');
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-page-header] button')?.click();
    });
    expect(router.state.location.pathname).toBe('/source');
  });
});
