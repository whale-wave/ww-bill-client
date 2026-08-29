export type ShortcutDraftSource = 'ALIPAY' | 'UNKNOWN' | 'WECHAT';
export type ShortcutDraftStatus = 'CLAIMED' | 'DISCARDED' | 'EXPIRED' | 'NEEDS_REVIEW' | 'SAVED';

export interface ShortcutAccessTokenSummary {
  confirmationBaseUrl: string;
  createdAt: string;
  expiresAt: string;
  id: string;
  lastUsedAt?: string;
  name: string;
  tokenPrefix: string;
}

export interface IssuedShortcutAccessToken extends ShortcutAccessTokenSummary {
  token: string;
}

export interface ShortcutDraft {
  amountCandidate?: string;
  capturedAt?: string;
  expiresAt: string;
  id: string;
  merchantCandidate: string;
  rawText: string;
  source: ShortcutDraftSource;
  status: ShortcutDraftStatus;
  warnings: string[];
}

export interface ClaimedShortcutDraft extends ShortcutDraft {
  reviewCode: string;
}

export interface ConfirmShortcutDraftInput {
  amount: string;
  categoryId: number;
  code: string;
  draftId: string;
  ledgerId: string;
  remark: string;
  time: string;
  type: 'add' | 'sub';
}

export interface ConfirmedShortcutDraft {
  alreadySaved: boolean;
  draftId: string;
  ledgerId: string;
  recordId: number;
  status: 'SAVED';
}
