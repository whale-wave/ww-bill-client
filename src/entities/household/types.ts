import type { MemberColorKey } from '@/shared/config/member-colors';

export enum HouseholdStatus {
  PENDING_PARTNER = 'PENDING_PARTNER',
  ACTIVE = 'ACTIVE',
  DISSOLVED = 'DISSOLVED',
}

export enum HouseholdMemberRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

// eslint-disable-next-line ts/no-namespace
export namespace HouseholdMemberRole {
  /** @deprecated Kept as a source-compatible alias for existing callers. */
  export const PARTNER: HouseholdMemberRole = HouseholdMemberRole.MEMBER;
}

export enum HouseholdMemberStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
}

export enum HouseholdInvitationStatus {
  ACTIVE = 'ACTIVE',
  CONSUMED = 'CONSUMED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum FamilyRecordPolicy {
  INHERIT = 'INHERIT',
  SHARED_COUNTED = 'SHARED_COUNTED',
  SHARED_UNCOUNTED = 'SHARED_UNCOUNTED',
  PRIVATE = 'PRIVATE',
}

export enum HouseholdBudgetPeriodType {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface HouseholdUserSummary {
  id: number;
  name?: string;
  username?: string;
  avatar?: string;
  nickname?: string;
  colorKey?: MemberColorKey;
}

export interface HouseholdMember {
  id: string;
  user: HouseholdUserSummary;
  role: HouseholdMemberRole;
  nickname: string;
  colorKey?: MemberColorKey;
  joinedAt: string;
  version: number;
}

export interface Household {
  id: string;
  sharedStartMonth: string;
  status: HouseholdStatus;
  activatedAt?: string;
  dissolvedAt?: string;
  version: number;
  myRole?: HouseholdMemberRole;
  members: HouseholdMember[];
  memberCount?: number;
  memberLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  code: string;
  status: HouseholdInvitationStatus;
  expiresAt: string;
  version: number;
}

export interface HouseholdInvitationRevocation {
  id: string;
  status: HouseholdInvitationStatus.REVOKED;
  revokedAt: string;
}

export interface HouseholdInvitationPreview {
  householdId: string;
  householdVersion: number;
  sharedStartMonth: string;
  creator: HouseholdUserSummary;
  members: HouseholdMember[];
  expiresAt: string;
}

export interface CreateHouseholdResult {
  household: Household;
  invitation: HouseholdInvitation;
}

export interface FamilyRecordCategory {
  id: number;
  key?: string;
  name: string;
  icon: string;
  templateKey?: string;
}

export interface FamilyRecordTag {
  id: string;
  name: string;
  colorKey?: string;
  iconKey?: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface FamilyRecordAttachment {
  id: string;
  type: 'IMAGE';
  sortOrder: number;
  createdAt: string;
  contentHash: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
}

export interface FamilyRecord {
  id: number;
  remark: string;
  time: string;
  type: 'add' | 'sub';
  amount: string;
  version: number;
  creator: HouseholdUserSummary;
  category?: FamilyRecordCategory;
  tags: FamilyRecordTag[];
  attachments?: FamilyRecordAttachment[];
  policy: FamilyRecordPolicy;
  effectivePolicy: Exclude<FamilyRecordPolicy, FamilyRecordPolicy.INHERIT>;
  counted: boolean;
  policyVersion?: number;
}

export interface HouseholdRecordSummary {
  income: string;
  expense: string;
  net: string;
}

export interface HouseholdRecordsPage {
  data: FamilyRecord[];
  daySummaries?: Array<{
    date: string;
    expense: string;
    income: string;
  }>;
  total: number;
  limit: number;
  offset: number;
  summary: HouseholdRecordSummary;
}

export interface FamilyRecordPolicyResult {
  householdId: string;
  ledgerId: string;
  recordId: number;
  policy: FamilyRecordPolicy;
  effectivePolicy: Exclude<FamilyRecordPolicy, FamilyRecordPolicy.INHERIT>;
  version?: number;
}

export interface HouseholdBudget {
  id: string;
  householdId: string;
  periodType: HouseholdBudgetPeriodType;
  periodStart: string;
  categoryKey?: string;
  categoryName?: string;
  icon?: string;
  iconKey?: string;
  iconType?: 'BUILTIN' | 'IMAGE';
  amount: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdBudgetProgress {
  budget: HouseholdBudget | null;
  amount: string;
  spent: string;
  remaining: string;
  remainingPercent: number | null;
  remainingDays: number;
  remainingDaily: string;
}

export interface HouseholdBudgetCategoryProgress {
  budget: HouseholdBudget;
  spent: string;
  remaining: string;
  remainingPercent: number | null;
}

export interface HouseholdBudgetOverview {
  periodType: HouseholdBudgetPeriodType;
  periodStart: string;
  summary: HouseholdBudgetProgress;
  categories: HouseholdBudgetCategoryProgress[];
  spendingByCategory: Array<{
    categoryKey: string;
    categoryName: string;
    icon?: string;
    iconKey?: string;
    iconType?: 'BUILTIN' | 'IMAGE';
    spent: string;
  }>;
  availableCategories: Array<{
    categoryKey: string;
    categoryName: string;
    icon?: string;
    iconKey?: string;
    iconType?: 'BUILTIN' | 'IMAGE';
    sortOrder?: number;
    status?: 'ACTIVE' | 'ARCHIVED';
  }>;
}

export type HouseholdChartPeriod = 'week' | 'month' | 'year';
export type HouseholdChartMetric = 'expense' | 'income' | 'net';
export type HouseholdChartDisplay = 'pie' | 'line';

export interface HouseholdChartWeekPeriodOption {
  period: 'week';
  key: string;
  anchorDate: string;
  isoWeekYear: number;
  isoWeek: number;
}

export interface HouseholdChartMonthPeriodOption {
  period: 'month';
  key: string;
  anchorDate: string;
  year: number;
  month: number;
}

export interface HouseholdChartYearPeriodOption {
  period: 'year';
  key: string;
  anchorDate: string;
  year: number;
}

export type HouseholdChartPeriodOption
  = | HouseholdChartWeekPeriodOption
    | HouseholdChartMonthPeriodOption
    | HouseholdChartYearPeriodOption;

export interface HouseholdChartResult {
  period: HouseholdChartPeriod;
  anchorDate: string;
  startDate: string;
  endDate: string;
  metric: HouseholdChartMetric;
  display: HouseholdChartDisplay;
  summary: HouseholdRecordSummary;
  timeline: Array<{
    key: string;
    label: string;
    income: string;
    expense: string;
    net: string;
  }>;
  categories: Array<{
    key: string;
    name: string;
    icon?: string;
    amount: string;
    percent: number;
  }>;
  members: Array<{
    user: HouseholdUserSummary;
    amount: string;
    percent: number;
  }>;
}

export interface HouseholdCalendarDay {
  date: string;
  recordCount: number;
  visibleIncome: string;
  visibleExpense: string;
  countedIncome: string;
  countedExpense: string;
}

export interface HouseholdCalendarResult {
  month: string;
  days: HouseholdCalendarDay[];
}

export type HouseholdExportFormat = 'csv' | 'xlsx';
export type HouseholdExportTaskStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface HouseholdExportFilters {
  startDate?: string;
  endDate?: string;
  type?: 'add' | 'sub';
  counted?: boolean;
}

export interface HouseholdExportTask {
  id: string;
  format: HouseholdExportFormat;
  status: HouseholdExportTaskStatus;
  filters: HouseholdExportFilters;
  fileName?: string;
  mimeType?: string;
  size?: number;
  recordCount?: number;
  error?: string;
  expiresAt: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
