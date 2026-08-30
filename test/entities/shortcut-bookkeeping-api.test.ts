import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  claimShortcutDraftApi,
  confirmShortcutDraftApi,
  discardShortcutDraftApi,
  issueShortcutAccessTokenApi,
  revokeShortcutAccessTokenApi,
} from '@/entities/shortcut-bookkeeping/api';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ request }));

describe('shortcut bookkeeping api', () => {
  beforeEach(() => Object.values(request).forEach(mock => mock.mockReset()));

  it('manages a draft-only credential without exposing it in URLs', () => {
    const data = {
      confirmationBaseUrl: 'https://bill.example',
      name: '我的 iPhone',
    };

    issueShortcutAccessTokenApi(data);
    revokeShortcutAccessTokenApi('token/a b');

    expect(request.post).toHaveBeenCalledWith('/shortcut-access/tokens', data);
    expect(request.delete).toHaveBeenCalledWith('/shortcut-access/tokens/token%2Fa%20b');
  });

  it('exchanges and discards handoff codes in POST bodies, never URL queries', () => {
    claimShortcutDraftApi('draft/a b', 'handoff-secret');
    discardShortcutDraftApi('draft/a b', 'review-secret');

    expect(request.post).toHaveBeenCalledWith(
      '/shortcut-drafts/draft%2Fa%20b/claim',
      { code: 'handoff-secret' },
    );
    expect(request.post).toHaveBeenCalledWith(
      '/shortcut-drafts/draft%2Fa%20b/discard',
      { code: 'review-secret' },
    );
    expect(request.get).not.toHaveBeenCalled();
  });

  it('confirms only explicit record fields with the exchanged review code', () => {
    confirmShortcutDraftApi({
      amount: '18.6',
      categoryId: 4,
      code: 'handoff-secret',
      draftId: 'draft/a b',
      ledgerId: 'ledger-1',
      remark: '鲸鱼便利店',
      time: '2026-08-29T10:00:00.000Z',
      type: 'sub',
    });

    expect(request.post).toHaveBeenCalledWith(
      '/shortcut-drafts/draft%2Fa%20b/confirm',
      {
        amount: '18.6',
        categoryId: 4,
        code: 'handoff-secret',
        ledgerId: 'ledger-1',
        remark: '鲸鱼便利店',
        time: '2026-08-29T10:00:00.000Z',
        type: 'sub',
      },
    );
  });
});
