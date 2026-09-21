import type { SharkImportPreview } from '@/entities/record-import';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SharkImportPreviewPage from '@/pages/import-data/SharkImportPreviewPage';

const mocks = vi.hoisted(() => ({
  commit: vi.fn(),
  get: vi.fn(),
  save: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('@/entities/record-import', () => ({
  commitSharkImport: mocks.commit,
  getSharkImport: mocks.get,
  saveSharkImportDraft: mocks.save,
}));
vi.mock('@/shared/ui/app-feedback', () => ({ showAppError: mocks.showError }));

const ledgerId = '11111111-1111-4111-8111-111111111111';
const batchId = '22222222-2222-4222-8222-222222222222';

function preview(): SharkImportPreview {
  return {
    id: batchId,
    revision: 1,
    status: 'DRAFT',
    expiresAt: '2026-09-22T00:00:00.000Z',
    assetLinkAllowed: true,
    assets: [],
    rows: [{
      sourceRow: 2,
      include: true,
      date: '2026-09-19',
      type: 'sub',
      categoryName: '餐饮',
      categoryId: null,
      sourceAccount: '未关联',
      amount: '12.50',
      remark: '午饭',
      tagNames: ['朋友'],
      assetId: null,
      assetMode: 'NONE',
      issues: [],
      warnings: [],
    }],
    summary: {
      included: 1,
      income: '0',
      expense: '12.50',
      newCategories: 1,
      newTags: 1,
      problems: 0,
      linked: 0,
      posted: 0,
      linkOnly: 0,
    },
    result: null,
  };
}

let cleanup = () => {};
function renderPage(data = preview()) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  queryClient.setQueryData(['record-import', 'shark', ledgerId, batchId], data);
  const router = createMemoryRouter([
    { path: '/import/:batchId', element: <SharkImportPreviewPage /> },
  ], { initialEntries: [`/import/${batchId}?ledgerId=${ledgerId}`] });
  act(() => root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  ));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

beforeEach(() => {
  mocks.get.mockResolvedValue(preview());
  mocks.save.mockImplementation(async (_ledgerId, _batchId, _revision, rows) => ({
    ...preview(),
    revision: 2,
    rows: preview().rows.map(row => ({ ...row, ...rows[0] })),
    summary: { ...preview().summary, included: rows[0].include ? 1 : 0 },
  }));
});
afterEach(() => {
  cleanup();
  cleanup = () => {};
  vi.clearAllMocks();
});

describe('shark import preview page', () => {
  it('shows the horizontal table and keeps confirmation in a separate footer', async () => {
    const container = renderPage();
    await act(async () => Promise.resolve());
    expect(container.querySelector('.overflow-x-auto table')).not.toBeNull();
    expect(container.textContent).toContain('午饭');
    expect(container.textContent).toContain('朋友');
    expect(container.querySelector('footer')?.textContent).toContain('确认导入');
    expect(container.querySelector('footer button')?.hasAttribute('disabled')).toBe(false);
  });

  it('deletes a row from the draft and disables confirmation when no rows remain', async () => {
    const container = renderPage();
    await act(async () => Promise.resolve());
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="删除第 2 行"]')?.click();
    });
    expect(mocks.save).toHaveBeenCalledWith(ledgerId, batchId, 1, [expect.objectContaining({ sourceRow: 2, include: false })]);
    expect(container.querySelector('footer button')?.hasAttribute('disabled')).toBe(true);
  });

  it('opens the row editor and saves the edited draft', async () => {
    const container = renderPage();
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="编辑第 2 行"]')?.click();
    });
    expect(document.body.textContent).toContain('编辑导入记录');
    const saveButton = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '保存修改');
    await act(async () => saveButton?.click());
    expect(mocks.save).toHaveBeenCalledWith(ledgerId, batchId, 1, [expect.objectContaining({ sourceRow: 2, remark: '午饭' })]);
  });

  it('shows a failure and refreshes the draft when confirmation fails', async () => {
    const failure = new Error('导入失败');
    mocks.commit.mockRejectedValueOnce(failure);
    const container = renderPage();
    await act(async () => {
      container.querySelector<HTMLButtonElement>('footer button')?.click();
    });
    expect(mocks.showError).toHaveBeenCalledWith(failure);
    expect(mocks.get).toHaveBeenCalled();
    expect(container.querySelector('footer')).not.toBeNull();
  });

  it('filters problem rows without hiding the fixed confirmation state', async () => {
    const data = preview();
    data.summary.problems = 1;
    data.rows.push({
      ...data.rows[0],
      sourceRow: 3,
      categoryName: '待修正',
      issues: [{ field: 'categoryName', message: '类别名称须为 1 至 12 个字' }],
    });
    const container = renderPage(data);
    await act(async () => {
      [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent?.includes('待处理 1'))
        ?.click();
    });
    expect(container.querySelector('button[aria-label="编辑第 2 行"]')).toBeNull();
    expect(container.querySelector('button[aria-label="编辑第 3 行"]')).not.toBeNull();
    expect(container.querySelector('footer button')?.hasAttribute('disabled')).toBe(true);
  });

  it('does not ask for asset choices in a non-personal ledger', async () => {
    const data = preview();
    data.assetLinkAllowed = false;
    data.rows[0].sourceAccount = '中信银行(5608)-信用卡';
    data.rows[0].assetMode = 'NONE';
    const container = renderPage(data);
    expect(container.textContent).toContain('导入时自动不关联资产');
    expect(container.querySelector('table')?.textContent).not.toContain('资产处理');
    expect(container.querySelector('footer button')?.hasAttribute('disabled')).toBe(false);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="编辑第 2 行"]')?.click();
    });
    expect(document.body.textContent).toContain('中信银行(5608)-信用卡');
    expect(document.body.textContent).not.toContain('资产关联');
    expect(document.body.textContent).not.toContain('明确不关联资产');
  });
});
