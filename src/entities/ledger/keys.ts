import type { GetLedgerMembersApiParams, GetLedgersApiParams } from './api';

export const ledgerKeys = {
  all: ['ledger'] as const,
  lists: () => [...ledgerKeys.all, 'list'] as const,
  list: (params?: GetLedgersApiParams) => [...ledgerKeys.lists(), params] as const,
  templateRoot: () => [...ledgerKeys.all, 'template'] as const,
  templates: () => [...ledgerKeys.templateRoot()] as const,
  details: () => [...ledgerKeys.all, 'detail'] as const,
  detail: (ledgerId: string) => [...ledgerKeys.details(), ledgerId] as const,
  preferenceRoot: () => [...ledgerKeys.all, 'preference'] as const,
  preferences: (ledgerId: string) => [
    ...ledgerKeys.preferenceRoot(),
    ledgerId,
  ] as const,
  invitationPreviewRoot: () => [...ledgerKeys.all, 'invitation-preview'] as const,
  invitationPreview: (code: string) => [
    ...ledgerKeys.invitationPreviewRoot(),
    code,
  ] as const,
  joinRequestRoot: () => [...ledgerKeys.all, 'join-request'] as const,
  myJoinRequests: () => [...ledgerKeys.joinRequestRoot(), 'mine'] as const,
  ledgerJoinRequestsRoot: () => [
    ...ledgerKeys.joinRequestRoot(),
    'ledger',
  ] as const,
  joinRequests: (ledgerId: string) => [
    ...ledgerKeys.ledgerJoinRequestsRoot(),
    ledgerId,
  ] as const,
  memberRoot: () => [...ledgerKeys.all, 'member'] as const,
  membersRoot: (ledgerId: string) => [...ledgerKeys.memberRoot(), ledgerId] as const,
  members: (ledgerId: string, params?: GetLedgerMembersApiParams) => [
    ...ledgerKeys.membersRoot(ledgerId),
    params,
  ] as const,
};
