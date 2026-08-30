import type {
  ClaimedShortcutDraft,
  ConfirmedShortcutDraft,
  ConfirmShortcutDraftInput,
  IssuedShortcutAccessToken,
  ShortcutAccessTokenSummary,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function issueShortcutAccessTokenApi(data: {
  confirmationBaseUrl: string;
  name: string;
}) {
  return request.post<unknown, SuccessResponse<IssuedShortcutAccessToken>>(
    '/shortcut-access/tokens',
    data,
  );
}

export function getShortcutAccessTokensApi() {
  return request.get<unknown, SuccessResponse<ShortcutAccessTokenSummary[]>>(
    '/shortcut-access/tokens',
  );
}

export function revokeShortcutAccessTokenApi(tokenId: string) {
  return request.delete<unknown, SuccessResponse<{ id: string; revokedAt: string }>>(
    `/shortcut-access/tokens/${encodeURIComponent(tokenId)}`,
  );
}

export function claimShortcutDraftApi(draftId: string, code: string) {
  return request.post<unknown, SuccessResponse<ClaimedShortcutDraft>>(
    `/shortcut-drafts/${encodeURIComponent(draftId)}/claim`,
    { code },
  );
}

export function discardShortcutDraftApi(draftId: string, code: string) {
  return request.post<unknown, SuccessResponse<{ draftId: string; status: 'DISCARDED' }>>(
    `/shortcut-drafts/${encodeURIComponent(draftId)}/discard`,
    { code },
  );
}

export function confirmShortcutDraftApi({ draftId, ...data }: ConfirmShortcutDraftInput) {
  return request.post<unknown, SuccessResponse<ConfirmedShortcutDraft>>(
    `/shortcut-drafts/${encodeURIComponent(draftId)}/confirm`,
    data,
  );
}
