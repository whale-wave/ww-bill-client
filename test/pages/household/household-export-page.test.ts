import type { ReactNode } from 'react';
import type { Household } from '@/entities/household';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdMemberRole, HouseholdStatus } from '@/entities/household';
import HouseholdExportPage from '@/pages/household-export/HouseholdExportPage';

const hooks = vi.hoisted(() => ({
  createExport: vi.fn(),
  downloadExport: vi.fn(),
  useCreateHouseholdExportMutation: vi.fn(),
  useDownloadHouseholdExportMutation: vi.fn(),
  useHouseholdExportTaskQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useCreateHouseholdExportMutation: hooks.useCreateHouseholdExportMutation,
  useDownloadHouseholdExportMutation: hooks.useDownloadHouseholdExportMutation,
  useHouseholdExportTaskQuery: hooks.useHouseholdExportTaskQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
}));

vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const household: Household = {
  activatedAt: '2026-07-01T00:00:00.000Z',
  createdAt: '2026-07-01T00:00:00.000Z',
  id: 'household/a',
  members: [],
  myRole: HouseholdMemberRole.OWNER,
  sharedStartMonth: '2026-07-01',
  status: HouseholdStatus.ACTIVE,
  updatedAt: '2026-07-01T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/households/:householdId/export', element },
  ], { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useMyHouseholdQuery.mockReturnValue({
    data: household,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useCreateHouseholdExportMutation.mockReturnValue([hooks.createExport, { isLoading: false }]);
  hooks.useDownloadHouseholdExportMutation.mockReturnValue([hooks.downloadExport, { isLoading: false }]);
  hooks.useHouseholdExportTaskQuery.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('householdExportPage', () => {
  it('creates a household-scoped task from time, type and counted filters', async () => {
    hooks.createExport.mockResolvedValue({ data: { id: 'task-1', status: 'PENDING' } });
    const { container, router } = renderPage(
      '/households/household%2Fa/export',
      createElement(HouseholdExportPage),
    );
    const start = container.querySelector<HTMLInputElement>('input[name="startDate"]');
    const type = container.querySelector<HTMLSelectElement>('select[name="type"]');
    const counted = container.querySelector<HTMLSelectElement>('select[name="counted"]');
    if (start)
      start.value = '2026-07-01';
    if (type)
      type.value = 'sub';
    if (counted)
      counted.value = 'false';
    await act(async () => container.querySelector<HTMLFormElement>('[data-testid="household-export-form"]')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect(hooks.createExport).toHaveBeenCalledWith({
      data: {
        filters: {
          counted: false,
          startDate: '2026-07-01T00:00:00.000Z',
          type: 'sub',
        },
        format: 'xlsx',
        idempotencyKey: expect.any(String),
      },
      householdId: 'household/a',
    });
    expect(router.state.location.search).toBe('?taskId=task-1');
  });

  it('loads a task only from the current household URL and exposes download when complete', async () => {
    hooks.useHouseholdExportTaskQuery.mockReturnValue({
      data: {
        createdAt: '2026-07-21T00:00:00.000Z',
        expiresAt: '2026-07-22T00:00:00.000Z',
        fileName: 'household-export.xlsx',
        format: 'xlsx',
        id: 'task-1',
        recordCount: 2,
        size: 128,
        status: 'COMPLETED',
        updatedAt: '2026-07-21T00:00:01.000Z',
        version: 2,
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const { container } = renderPage(
      '/households/household%2Fa/export?taskId=task-1',
      createElement(HouseholdExportPage),
    );
    expect(hooks.useHouseholdExportTaskQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: { householdId: 'household/a', taskId: 'task-1' },
    }));
    expect(container.querySelector('[data-testid="household-export-download"]')).not.toBeNull();
  });
});
