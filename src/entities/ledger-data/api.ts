import type {
  LedgerExportFilters,
  LedgerExportFormat,
  LedgerExportTask,
  LedgerTag,
  LedgerTagStatus,
  LedgerTransferPreview,
  LedgerTransferRequest,
  LedgerTransferResult,
  RecoverableLedgerRecord,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface GetLedgerTagsApiParams {
  status?: LedgerTagStatus | 'ACTIVE' | 'ARCHIVED';
}

export function getLedgerTagsApi(
  ledgerId: string,
  params?: GetLedgerTagsApiParams,
) {
  return request.get<unknown, SuccessResponse<LedgerTag[]>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/tags`,
    { params },
  );
}

export interface PostLedgerTagApiData {
  name: string;
  colorKey?: string | null;
  iconKey?: string | null;
}

export function postLedgerTagApi(ledgerId: string, data: PostLedgerTagApiData) {
  return request.post<unknown, SuccessResponse<LedgerTag>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/tags`,
    data,
  );
}

export interface PatchLedgerTagApiData extends Partial<PostLedgerTagApiData> {
  version: number;
}

export function patchLedgerTagApi(
  ledgerId: string,
  tagId: string,
  data: PatchLedgerTagApiData,
) {
  return request.patch<unknown, SuccessResponse<LedgerTag>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/tags/${encodeURIComponent(tagId)}`,
    data,
  );
}

export function deleteLedgerTagApi(
  ledgerId: string,
  tagId: string,
  data: { version: number },
) {
  return request.delete<unknown, SuccessResponse<LedgerTag>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/tags/${encodeURIComponent(tagId)}`,
    { data },
  );
}

export interface GetLedgerRecoveryRecordsApiParams {
  days?: number;
}

export function getLedgerRecoveryRecordsApi(
  ledgerId: string,
  params: GetLedgerRecoveryRecordsApiParams = { days: 30 },
) {
  return request.get<unknown, SuccessResponse<RecoverableLedgerRecord[]>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/recovery/records`,
    { params },
  );
}

export interface PostLedgerRestoreRecordApiData {
  version: number;
  replacementCategoryId?: number;
}

export function postLedgerRestoreRecordApi(
  ledgerId: string,
  recordId: number,
  data: PostLedgerRestoreRecordApiData,
) {
  return request.post<unknown, SuccessResponse<RecoverableLedgerRecord>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/recovery/records/${encodeURIComponent(recordId)}`,
    data,
  );
}

export function postLedgerTransferPreviewApi(data: LedgerTransferRequest) {
  return request.post<unknown, SuccessResponse<LedgerTransferPreview>>(
    '/ledger-transfers/preview',
    data,
  );
}

export function postLedgerTransferExecuteApi(data: LedgerTransferRequest) {
  return request.post<unknown, SuccessResponse<LedgerTransferResult>>(
    '/ledger-transfers/execute',
    data,
  );
}

export interface PostLedgerExportApiData {
  filters: LedgerExportFilters;
  format: LedgerExportFormat;
  idempotencyKey: string;
}

export function postLedgerExportApi(
  ledgerId: string,
  data: PostLedgerExportApiData,
) {
  return request.post<unknown, SuccessResponse<LedgerExportTask>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/exports`,
    data,
  );
}

export function getLedgerExportTaskApi(ledgerId: string, taskId: string) {
  return request.get<unknown, SuccessResponse<LedgerExportTask>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/exports/${encodeURIComponent(taskId)}`,
  );
}

export function downloadLedgerExportApi(ledgerId: string, taskId: string) {
  return request.get<unknown, Blob>(
    `/ledgers/${encodeURIComponent(ledgerId)}/exports/${encodeURIComponent(taskId)}/download`,
    { responseType: 'blob' },
  );
}
