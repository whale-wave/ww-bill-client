import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShortcutBookkeepingConfirmPage from '@/pages/shortcut-bookkeeping-confirm/ShortcutBookkeepingConfirmPage';

const mocks = vi.hoisted(() => ({
  claimDraft: vi.fn(),
  draft: {
    amountCandidate: '18.60',
    capturedAt: '2026-08-29T10:00:00.000Z',
    expiresAt: '2026-08-30T10:00:00.000Z',
    id: 'draft-1',
    merchantCandidate: '鲸鱼便利店',
    rawText: '微信支付\n支付金额 ￥18.60\n收款方 鲸鱼便利店',
    source: 'WECHAT' as const,
    status: 'NEEDS_REVIEW' as const,
    warnings: [],
  },
}));

vi.mock('@/entities/category', () => ({
  useLedgerCategoriesQuery: () => ({ data: [], isError: false, isLoading: false, refetch: vi.fn() }),
}));

vi.mock('@/entities/ledger', () => ({
  LedgerCapability: { RECORD_CREATE: 'record:create' },
  LedgerRecordType: { EXPENSE: 'sub', INCOME: 'add' },
  useLedgerNavigationQuery: () => ({
    data: [
      { capabilities: ['record:create'], id: 'ledger-write', name: '家庭账本' },
      { capabilities: ['record:read'], id: 'ledger-read', name: '只读账本' },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/entities/shortcut-bookkeeping', () => ({
  useClaimShortcutDraftMutation: () => ({
    isError: false,
    mutateAsync: mocks.claimDraft,
    reset: vi.fn(),
  }),
  useConfirmShortcutDraftMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  useDiscardShortcutDraftMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/features/record-editor', () => ({
  invalidateLedgerRecordEditorCaches: vi.fn(),
  RecordEditorPresentation: () => createElement('div', { 'data-testid': 'shortcut-record-editor' }, 'editor'),
  useRecordEditorController: () => ({ isSubmitting: false, recordType: 'sub' }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup = () => {};

function renderPage(initialEntry = '/bookkeeping/import?draftId=draft-1&code=handoff-code') {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const queryClient = new QueryClient();
  act(() => root.render(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(
      MemoryRouter,
      { initialEntries: [initialEntry] },
      createElement(ShortcutBookkeepingConfirmPage),
    ),
  )));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

function buttonByText(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(button => button.textContent?.includes(text));
}

describe('shortcut bookkeeping confirmation page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.claimDraft.mockReset().mockResolvedValue({
      ...mocks.draft,
      reviewCode: 'review-code-00001',
      status: 'CLAIMED' as const,
    });
  });

  afterEach(() => cleanup());

  it('requires explicit record type and writable-ledger choices before opening the editor', async () => {
    const container = renderPage();
    await act(async () => Promise.resolve());
    const continueButton = buttonByText(container, 'shortcutBookkeeping.continueReview');

    expect(container.textContent).toContain('鲸鱼便利店');
    expect(container.textContent).toContain('家庭账本');
    expect(container.textContent).not.toContain('只读账本');
    expect(continueButton?.disabled).toBe(true);

    act(() => buttonByText(container, '家庭账本')?.click());
    expect(continueButton?.disabled).toBe(true);
    act(() => buttonByText(container, 'shortcutBookkeeping.expense')?.click());
    expect(continueButton?.disabled).toBe(false);

    act(() => continueButton?.click());
    expect(container.querySelector('[data-testid="shortcut-record-editor"]')).not.toBeNull();
  });

  it('recovers a claimed draft after refresh without keeping the code in the URL', async () => {
    renderPage();
    await act(async () => Promise.resolve());
    expect(sessionStorage.getItem('ww-shortcut-handoff:draft-1')).toBe('handoff-code');

    cleanup();
    const refreshedContainer = renderPage('/bookkeeping/import?draftId=draft-1');
    await act(async () => Promise.resolve());

    expect(mocks.claimDraft).toHaveBeenCalledTimes(2);
    expect(refreshedContainer.textContent).toContain('鲸鱼便利店');
  });
});
