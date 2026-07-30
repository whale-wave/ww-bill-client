import type {
  CreateHouseholdResult,
  FamilyRecord,
  FamilyRecordPolicy,
  FamilyRecordPolicyResult,
  Household,
  HouseholdBudget,
  HouseholdBudgetOverview,
  HouseholdBudgetPeriodType,
  HouseholdCalendarResult,
  HouseholdChartDisplay,
  HouseholdChartMetric,
  HouseholdChartPeriod,
  HouseholdChartResult,
  HouseholdExportFilters,
  HouseholdExportFormat,
  HouseholdExportTask,
  HouseholdInvitation,
  HouseholdInvitationPreview,
  HouseholdInvitationRevocation,
  HouseholdMember,
  HouseholdRecordsPage,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface PostHouseholdApiData {
  sharedStartMonth: string;
  sharingConsentConfirmed: true;
  idempotencyKey?: string;
}

export function postHouseholdApi(data: PostHouseholdApiData) {
  return request.post<unknown, SuccessResponse<CreateHouseholdResult>>('/households', data);
}

export function getMyHouseholdApi() {
  return request.get<unknown, SuccessResponse<Household | null>>('/households/mine');
}

export function getHouseholdMembersApi(householdId: string) {
  return request.get<unknown, SuccessResponse<HouseholdMember[]>>(
    `/households/${encodeURIComponent(householdId)}/members`,
  );
}

export interface PatchHouseholdApiData {
  sharedStartMonth: string;
  version: number;
}

export function patchHouseholdApi(
  householdId: string,
  data: PatchHouseholdApiData,
) {
  return request.patch<unknown, SuccessResponse<Household>>(
    `/households/${encodeURIComponent(householdId)}`,
    data,
  );
}

export interface PatchMyHouseholdNicknameApiData {
  nickname: string;
  version: number;
}

export interface PatchMyHouseholdNicknameResult {
  householdId: string;
  userId: number;
  nickname: string;
  version: number;
}

export function patchMyHouseholdNicknameApi(
  householdId: string,
  data: PatchMyHouseholdNicknameApiData,
) {
  return request.patch<unknown, SuccessResponse<PatchMyHouseholdNicknameResult>>(
    `/households/${encodeURIComponent(householdId)}/members/me`,
    data,
  );
}

export interface PostDissolveHouseholdApiData {
  version: number;
  confirmed: true;
  reason?: string;
}

export interface DissolveHouseholdResult {
  id: string;
  status: 'DISSOLVED';
  dissolvedAt: string;
}

export function postDissolveHouseholdApi(
  householdId: string,
  data: PostDissolveHouseholdApiData,
) {
  return request.post<unknown, SuccessResponse<DissolveHouseholdResult>>(
    `/households/${encodeURIComponent(householdId)}/dissolve`,
    data,
  );
}

export interface GetHouseholdRecordsApiParams {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  keywordTarget?: 'all' | 'category' | 'tag' | 'remark' | 'amount';
  dateMode?: 'range';
  type?: 'add' | 'sub';
  memberUserId?: number;
  categoryIds?: number[];
  tagIds?: string[];
  minAmount?: string;
  maxAmount?: string;
  policy?: FamilyRecordPolicy;
  countedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface HouseholdRecordFilterOptions {
  capabilities: {
    category: boolean;
    member: boolean;
    tag: boolean;
  };
  categories: Array<{
    icon: string;
    id: number;
    name: string;
    type: 'add' | 'sub';
  }>;
  members: HouseholdMember[];
  tags: Array<{
    id: string;
    name: string;
    status: 'ACTIVE' | 'ARCHIVED';
  }>;
}

export function getHouseholdRecordsApi(
  householdId: string,
  params?: GetHouseholdRecordsApiParams,
) {
  return request.get<unknown, SuccessResponse<HouseholdRecordsPage>>(
    `/households/${encodeURIComponent(householdId)}/records`,
    { params },
  );
}

export function getHouseholdRecordFilterOptionsApi(householdId: string) {
  return request.get<unknown, SuccessResponse<HouseholdRecordFilterOptions>>(
    `/households/${encodeURIComponent(householdId)}/records/filter-options`,
  );
}

export function getHouseholdRecordApi(
  householdId: string,
  recordId: number,
) {
  return request.get<unknown, SuccessResponse<FamilyRecord>>(
    `/households/${encodeURIComponent(householdId)}/records/${encodeURIComponent(recordId)}`,
  );
}

export function getFamilyRecordPolicyApi(
  householdId: string,
  recordId: number,
) {
  return request.get<unknown, SuccessResponse<FamilyRecordPolicyResult>>(
    `/households/${encodeURIComponent(householdId)}/records/${encodeURIComponent(recordId)}/policy`,
  );
}

export interface PutFamilyRecordPolicyApiData {
  policy: FamilyRecordPolicy;
  version?: number;
}

export function putFamilyRecordPolicyApi(
  householdId: string,
  recordId: number,
  data: PutFamilyRecordPolicyApiData,
) {
  return request.put<unknown, SuccessResponse<FamilyRecordPolicyResult>>(
    `/households/${encodeURIComponent(householdId)}/records/${encodeURIComponent(recordId)}/policy`,
    data,
  );
}

export interface PostHouseholdInvitationApiData {
  sharingConsentConfirmed: true;
  idempotencyKey?: string;
}

export function postHouseholdInvitationApi(
  householdId: string,
  data: PostHouseholdInvitationApiData,
) {
  return request.post<unknown, SuccessResponse<HouseholdInvitation>>(
    `/households/${encodeURIComponent(householdId)}/invitations`,
    data,
  );
}

export function deleteHouseholdInvitationApi(
  householdId: string,
  invitationId: string,
) {
  return request.delete<unknown, SuccessResponse<HouseholdInvitationRevocation>>(
    `/households/${encodeURIComponent(householdId)}/invitations/${encodeURIComponent(invitationId)}`,
  );
}

export function getHouseholdInvitationPreviewApi(code: string) {
  return request.get<unknown, SuccessResponse<HouseholdInvitationPreview>>(
    `/household-invitations/${encodeURIComponent(code)}`,
  );
}

export interface PostAcceptHouseholdInvitationApiData {
  expectedHouseholdVersion: number;
  expectedSharedStartMonth: string;
  sharingConsentConfirmed: true;
  nickname?: string;
}

export function postAcceptHouseholdInvitationApi(
  code: string,
  data: PostAcceptHouseholdInvitationApiData,
) {
  return request.post<unknown, SuccessResponse<Household>>(
    `/household-invitations/${encodeURIComponent(code)}/accept`,
    data,
  );
}

export interface GetHouseholdBudgetsApiParams {
  periodType: HouseholdBudgetPeriodType;
  periodStart: string;
}

export function getHouseholdBudgetsApi(
  householdId: string,
  params: GetHouseholdBudgetsApiParams,
) {
  return request.get<unknown, SuccessResponse<HouseholdBudgetOverview>>(
    `/households/${encodeURIComponent(householdId)}/budgets`,
    { params },
  );
}

export interface PutHouseholdBudgetApiData extends GetHouseholdBudgetsApiParams {
  amount: string;
  categoryKey?: string;
  categoryNameSnapshot?: string;
  iconKeySnapshot?: string;
  version?: number;
}

export function putHouseholdBudgetApi(
  householdId: string,
  data: PutHouseholdBudgetApiData,
) {
  return request.put<unknown, SuccessResponse<HouseholdBudget>>(
    `/households/${encodeURIComponent(householdId)}/budgets`,
    data,
  );
}

export function deleteHouseholdBudgetApi(
  householdId: string,
  budgetId: string,
  version: number,
) {
  return request.delete<unknown, SuccessResponse<{ id: string; deleted: true }>>(
    `/households/${encodeURIComponent(householdId)}/budgets/${encodeURIComponent(budgetId)}`,
    { params: { version } },
  );
}

export interface GetHouseholdChartsApiParams {
  period: HouseholdChartPeriod;
  anchorDate: string;
  metric: HouseholdChartMetric;
  display: HouseholdChartDisplay;
}

export function getHouseholdChartsApi(
  householdId: string,
  params: GetHouseholdChartsApiParams,
) {
  return request.get<unknown, SuccessResponse<HouseholdChartResult>>(
    `/households/${encodeURIComponent(householdId)}/charts`,
    { params },
  );
}

export interface GetHouseholdCalendarApiParams {
  month: string;
}

export function getHouseholdCalendarApi(
  householdId: string,
  params: GetHouseholdCalendarApiParams,
) {
  return request.get<unknown, SuccessResponse<HouseholdCalendarResult>>(
    `/households/${encodeURIComponent(householdId)}/calendar`,
    { params },
  );
}

export interface PostHouseholdExportApiData {
  filters: HouseholdExportFilters;
  format: HouseholdExportFormat;
  idempotencyKey: string;
}

export function postHouseholdExportApi(
  householdId: string,
  data: PostHouseholdExportApiData,
) {
  return request.post<unknown, SuccessResponse<HouseholdExportTask>>(
    `/households/${encodeURIComponent(householdId)}/exports`,
    data,
  );
}

export function getHouseholdExportTaskApi(householdId: string, taskId: string) {
  return request.get<unknown, SuccessResponse<HouseholdExportTask>>(
    `/households/${encodeURIComponent(householdId)}/exports/${encodeURIComponent(taskId)}`,
  );
}

export function downloadHouseholdExportApi(householdId: string, taskId: string) {
  return request.get<unknown, Blob>(
    `/households/${encodeURIComponent(householdId)}/exports/${encodeURIComponent(taskId)}/download`,
    { responseType: 'blob' },
  );
}
