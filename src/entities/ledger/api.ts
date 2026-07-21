import type {
  CreatableLedgerTemplateKey,
  Ledger,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  LedgerInvitation,
  LedgerInvitationPreview,
  LedgerInvitationRevocation,
  LedgerJoinDecision,
  LedgerJoinRequest,
  LedgerKind,
  LedgerMember,
  LedgerMemberStatus,
  LedgerOwnershipTransfer,
  LedgerPreference,
  LedgerRecordType,
  LedgerRole,
  LedgerStatus,
  LedgerTemplate,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface GetLedgersApiParams {
  kind?: LedgerKind;
  status?: LedgerStatus;
}

export function getLedgersApi(params?: GetLedgersApiParams) {
  return request.get<unknown, SuccessResponse<Ledger[]>>('/ledgers', { params });
}

export function getLedgerTemplatesApi() {
  return request.get<unknown, SuccessResponse<LedgerTemplate[]>>('/ledgers/templates');
}

export function getLedgerApi(ledgerId: string) {
  return request.get<unknown, SuccessResponse<Ledger>>(
    `/ledgers/${encodeURIComponent(ledgerId)}`,
  );
}

export interface PostLedgerApiData {
  name: string;
  monthStartDay: number;
  templateKey: CreatableLedgerTemplateKey;
  templateVersion: 1;
}

export function postLedgerApi(data: PostLedgerApiData) {
  return request.post<unknown, SuccessResponse<Ledger>>('/ledgers', data);
}

export interface PatchLedgerApiData {
  name?: string;
  monthStartDay?: number;
  iconKey?: string;
  themeKey?: string;
  version: number;
}

export function patchLedgerApi(ledgerId: string, data: PatchLedgerApiData) {
  return request.patch<unknown, SuccessResponse<Ledger>>(
    `/ledgers/${encodeURIComponent(ledgerId)}`,
    data,
  );
}

export function getLedgerPreferencesApi(ledgerId: string) {
  return request.get<unknown, SuccessResponse<LedgerPreference>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/preferences`,
  );
}

export interface PatchLedgerPreferencesApiData {
  showDailySummary?: boolean;
  hideTotalAmount?: boolean;
  defaultRecordType?: LedgerRecordType;
  defaultChartPeriod?: LedgerChartPeriod;
  defaultChartMetric?: LedgerChartMetric;
  defaultChartDisplay?: LedgerChartDisplay;
  version: number;
}

export function patchLedgerPreferencesApi(
  ledgerId: string,
  data: PatchLedgerPreferencesApiData,
) {
  return request.patch<unknown, SuccessResponse<LedgerPreference>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/preferences`,
    data,
  );
}

export interface PostArchiveLedgerApiData {
  version: number;
  confirmed: true;
  reason?: string;
}

export function postArchiveLedgerApi(
  ledgerId: string,
  data: PostArchiveLedgerApiData,
) {
  return request.post<unknown, SuccessResponse<Ledger>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/archive`,
    data,
  );
}

export interface PostLedgerInvitationApiData {
  sharingConsentConfirmed: true;
  idempotencyKey?: string;
}

export function postLedgerInvitationApi(
  ledgerId: string,
  data: PostLedgerInvitationApiData,
) {
  return request.post<unknown, SuccessResponse<LedgerInvitation>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/invitations`,
    data,
  );
}

export function deleteLedgerInvitationApi(ledgerId: string, invitationId: string) {
  return request.delete<unknown, SuccessResponse<LedgerInvitationRevocation>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/invitations/${encodeURIComponent(invitationId)}`,
  );
}

export function getLedgerInvitationPreviewApi(code: string) {
  return request.get<unknown, SuccessResponse<LedgerInvitationPreview>>(
    `/ledger-invitations/${encodeURIComponent(code)}`,
  );
}

export interface PostLedgerJoinRequestApiData {
  remark: string;
  idempotencyKey?: string;
}

export function postLedgerJoinRequestApi(
  code: string,
  data: PostLedgerJoinRequestApiData,
) {
  return request.post<unknown, SuccessResponse<LedgerJoinRequest>>(
    `/ledger-invitations/${encodeURIComponent(code)}/join-requests`,
    data,
  );
}

export function getMyLedgerJoinRequestsApi() {
  return request.get<unknown, SuccessResponse<LedgerJoinRequest[]>>(
    '/ledger-join-requests/mine',
  );
}

export function getLedgerJoinRequestsApi(ledgerId: string) {
  return request.get<unknown, SuccessResponse<LedgerJoinRequest[]>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/join-requests`,
  );
}

export interface PatchLedgerJoinRequestApiData {
  decision: LedgerJoinDecision;
  assignedRole?: Exclude<LedgerRole, LedgerRole.OWNER>;
  version: number;
  decisionRemark?: string;
}

export function patchLedgerJoinRequestApi(
  ledgerId: string,
  requestId: string,
  data: PatchLedgerJoinRequestApiData,
) {
  return request.patch<unknown, SuccessResponse<LedgerJoinRequest>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/join-requests/${encodeURIComponent(requestId)}`,
    data,
  );
}

export interface GetLedgerMembersApiParams {
  status?: LedgerMemberStatus;
}

export function getLedgerMembersApi(
  ledgerId: string,
  params?: GetLedgerMembersApiParams,
) {
  return request.get<unknown, SuccessResponse<LedgerMember[]>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/members`,
    { params },
  );
}

export interface PatchLedgerMemberApiData {
  role?: Exclude<LedgerRole, LedgerRole.OWNER>;
  nickname?: string;
  version: number;
}

export function patchLedgerMemberApi(
  ledgerId: string,
  memberId: string,
  data: PatchLedgerMemberApiData,
) {
  return request.patch<unknown, SuccessResponse<LedgerMember>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/members/${encodeURIComponent(memberId)}`,
    data,
  );
}

export function deleteLedgerMemberApi(
  ledgerId: string,
  memberId: string,
  version: number,
) {
  return request.delete<unknown, SuccessResponse<LedgerMember>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/members/${encodeURIComponent(memberId)}`,
    { params: { version } },
  );
}

export interface PostLeaveLedgerApiData {
  version: number;
}

export function postLeaveLedgerApi(
  ledgerId: string,
  data: PostLeaveLedgerApiData,
) {
  return request.post<unknown, SuccessResponse<LedgerMember>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/leave`,
    data,
  );
}

export interface PostLedgerOwnershipTransferApiData {
  targetMemberId: string;
  ownerVersion: number;
  targetVersion: number;
}

export function postLedgerOwnershipTransferApi(
  ledgerId: string,
  data: PostLedgerOwnershipTransferApiData,
) {
  return request.post<unknown, SuccessResponse<LedgerOwnershipTransfer>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/ownership-transfer`,
    data,
  );
}
