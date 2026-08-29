import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
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

vi.mock('@/entities/shortcut-bookkeeping', () => ({
  useClaimShortcutDraftMutation: () => ({
    isError: false,
    mutateAsync: mocks.claimDraft,
    reset: vi.fn(),
  }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup = () => {};

function Destination() {
  const location = useLocation();
  return createElement('div', { 'data-testid': 'destination' }, JSON.stringify(location.state));
}

function renderPage(initialEntry = '/bookkeeping/import?draftId=draft-1&code=handoff-code') {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const queryClient = new QueryClient();
  const router = createMemoryRouter([
    { path: '/bookkeeping/import', element: createElement(ShortcutBookkeepingConfirmPage) },
    { path: '/bookkeeping', element: createElement(Destination) },
    { path: '/detail', element: createElement('div', null, 'detail') },
  ], { initialEntries: [initialEntry] });
  act(() => root.render(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(RouterProvider, { router }),
  )));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
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

  it('claims the draft and hands it to the original bookkeeping route without keeping the code in the URL', async () => {
    const { container, router } = renderPage();
    await act(async () => Promise.resolve());
    expect(router.state.location.pathname).toBe('/bookkeeping');
    expect(router.state.location.search).toBe('');
    expect(container.querySelector('[data-testid="destination"]')?.textContent).toContain('review-code-00001');
    expect(container.querySelector('[data-testid="destination"]')?.textContent).toContain('鲸鱼便利店');
    expect(sessionStorage.getItem('ww-shortcut-handoff:draft-1')).toBeNull();
  });
});
