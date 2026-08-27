import type { MemberColorKey } from '@/shared/config/member-colors';

export enum LedgerKind {
  SYSTEM_DEFAULT = 'SYSTEM_DEFAULT',
  CUSTOM = 'CUSTOM',
}

export enum LedgerStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum LedgerRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  BOOKKEEPER = 'BOOKKEEPER',
  VIEWER = 'VIEWER',
}

export enum LedgerMemberStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  REMOVED = 'REMOVED',
}

export enum LedgerInvitationStatus {
  ACTIVE = 'ACTIVE',
  CONSUMED = 'CONSUMED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum LedgerJoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IGNORED = 'IGNORED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum LedgerJoinDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IGNORED = 'IGNORED',
}

export enum LedgerCapability {
  LEDGER_READ = 'ledger:read',
  LEDGER_UPDATE = 'ledger:update',
  LEDGER_ARCHIVE = 'ledger:archive',
  MEMBER_READ = 'member:read',
  MEMBER_INVITE = 'member:invite',
  MEMBER_REVIEW = 'member:review',
  MEMBER_MANAGE = 'member:manage',
  RECORD_READ = 'record:read',
  RECORD_CREATE = 'record:create',
  RECORD_UPDATE = 'record:update',
  RECORD_DELETE = 'record:delete',
  CATEGORY_READ = 'category:read',
  CATEGORY_MANAGE = 'category:manage',
  TAG_READ = 'tag:read',
  TAG_MANAGE = 'tag:manage',
  BUDGET_READ = 'budget:read',
  BUDGET_MANAGE = 'budget:manage',
  CHART_READ = 'chart:read',
  DATA_EXPORT = 'data:export',
  DATA_RECOVERY = 'data:recovery',
  DATA_TRANSFER = 'data:transfer',
  OWNERSHIP_TRANSFER = 'ownership:transfer',
}

export enum LedgerRecordType {
  EXPENSE = 'sub',
  INCOME = 'add',
}

export enum LedgerChartPeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum LedgerChartMetric {
  EXPENSE = 'expense',
  INCOME = 'income',
  NET = 'net',
}

export enum LedgerChartDisplay {
  PIE = 'pie',
  LINE = 'line',
}

export const PUBLIC_LEDGER_TEMPLATE_KEYS = [
  'business',
  'reimbursement',
  'company',
  'team',
  'micro-business',
  'custom',
] as const;

export type CreatableLedgerTemplateKey = typeof PUBLIC_LEDGER_TEMPLATE_KEYS[number];
export type LedgerTemplateKey = 'system-default' | CreatableLedgerTemplateKey;

const PUBLIC_LEDGER_TEMPLATE_KEY_SET: ReadonlySet<string> = new Set(
  PUBLIC_LEDGER_TEMPLATE_KEYS,
);

export function isCreatableLedgerTemplateKey(
  value: string | null | undefined,
): value is CreatableLedgerTemplateKey {
  return typeof value === 'string' && PUBLIC_LEDGER_TEMPLATE_KEY_SET.has(value);
}

export interface Ledger {
  id: string;
  ownerUserId: number;
  createdByUserId: number;
  name: string;
  kind: LedgerKind;
  templateKey?: LedgerTemplateKey;
  templateVersion?: number;
  iconKey: string;
  themeKey: string;
  monthStartDay: number;
  status: LedgerStatus;
  statusReason?: string;
  suspendedAt?: string;
  archivedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  myRole: LedgerRole;
  capabilities: readonly LedgerCapability[];
}

export interface MyLedgerMembership {
  id: string;
  version: number;
  sortOrder: number;
}

export interface LedgerListItem extends Ledger {
  activeMemberCount: number;
  recordCount: number;
  myMembership: MyLedgerMembership;
}

export interface LedgerOrderResult {
  ledgerId: string;
  sortOrder: number;
  memberVersion: number;
}

export interface LedgerTemplate {
  key: CreatableLedgerTemplateKey;
  version: 1;
  name: string;
  description: string;
  iconKey: string;
  themeKey: string;
  defaultName: string;
  categoryProfileKey: string;
}

export type AssignableLedgerRole = Exclude<LedgerRole, LedgerRole.OWNER>;

export interface LedgerUserSummary {
  id: number;
  name?: string;
  nickname?: string;
  username?: string;
  avatar?: string;
}

export interface LedgerSummary {
  id: string;
  name: string;
  kind: LedgerKind;
  templateKey?: LedgerTemplateKey;
  iconKey?: string;
  themeKey: string;
}

export interface LedgerInvitation {
  id: string;
  ledgerId: string;
  code: string;
  status: LedgerInvitationStatus;
  expiresAt: string;
  version: number;
}

export interface LedgerInvitationRevocation {
  id: string;
  status: LedgerInvitationStatus.REVOKED;
  revokedAt: string;
}

export interface LedgerInvitationPreview {
  ledger: LedgerSummary;
  owner: LedgerUserSummary;
  expiresAt: string;
}

export interface LedgerJoinRequest {
  id: string;
  ledger: LedgerSummary;
  applicant: LedgerUserSummary;
  applicantRemark: string;
  status: LedgerJoinRequestStatus;
  assignedRole?: AssignableLedgerRole;
  expiresAt: string;
  decidedByUserId?: number;
  decidedAt?: string;
  decisionRemark?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerMember {
  id: string;
  user: LedgerUserSummary;
  role: LedgerRole;
  status: LedgerMemberStatus;
  nickname: string;
  colorKey?: MemberColorKey;
  joinedAt: string;
  leftAt?: string;
  removedByUserId?: number;
  removedBy?: LedgerUserSummary;
  version: number;
  capabilities: readonly LedgerCapability[];
}

export interface LedgerOwnershipTransfer {
  ledgerId: string;
  ownerUserId: number;
  version: number;
  previousOwner: LedgerMember;
  newOwner: LedgerMember;
}

export interface LedgerPreference {
  id: string;
  showDailySummary: boolean;
  hideTotalAmount: boolean;
  defaultRecordType: LedgerRecordType;
  defaultChartPeriod: LedgerChartPeriod;
  defaultChartMetric: LedgerChartMetric;
  defaultChartDisplay: LedgerChartDisplay;
  version: number;
  updatedAt: string;
}
