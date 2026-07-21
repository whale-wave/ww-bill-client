import type { RecordEntry } from '@/entities/record';

export enum LedgerTagStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface LedgerTag {
  id: string;
  ledgerId: string;
  createdByUserId: number;
  name: string;
  colorKey?: string;
  iconKey?: string;
  status: LedgerTagStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecoverableLedgerRecord extends RecordEntry {
  ledgerId: string;
  deletedAt: string;
  deletedByUserId?: number;
  version: number;
}

export type LedgerTransferTagStrategy = 'drop' | 'map';

export interface LedgerTransferRequest {
  sourceLedgerId: string;
  targetLedgerId: string;
  recordIds: number[];
  categoryMappings: Record<string, number>;
  tagStrategy: LedgerTransferTagStrategy;
  tagMappings?: Record<string, string>;
  idempotencyKey: string;
}

export type LedgerTransferConflictCode
  = | 'RECORD_NOT_FOUND'
    | 'RECORD_DELETED'
    | 'CATEGORY_MAPPING_MISSING'
    | 'TARGET_CATEGORY_INVALID'
    | 'TARGET_CATEGORY_TYPE_MISMATCH'
    | 'TAG_MAPPING_MISSING'
    | 'TARGET_TAG_INVALID';

export interface LedgerTransferConflict {
  recordId: number;
  code: LedgerTransferConflictCode;
  message: string;
  sourceCategoryId?: number;
  sourceTagId?: string;
  targetCategoryId?: number;
  targetTagId?: string;
}

export interface LedgerTransferPreview {
  requestedCount: number;
  readyCount: number;
  conflictCount: number;
  conflicts: LedgerTransferConflict[];
}

export interface LedgerTransferResult {
  operationId: string;
  movedCount: number;
  recordIds: number[];
  sourceLedgerId: string;
  targetLedgerId: string;
}

export type LedgerExportFormat = 'csv' | 'xlsx';
export type LedgerExportTaskStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface LedgerExportFilters {
  startDate?: string;
  endDate?: string;
  type?: 'add' | 'sub';
  categoryIds?: number[];
  tagIds?: string[];
}

export interface LedgerExportTask {
  id: string;
  ledgerId: string;
  requestedByUserId: number;
  format: LedgerExportFormat;
  status: LedgerExportTaskStatus;
  filters: LedgerExportFilters;
  fileName?: string;
  mimeType?: string;
  size?: number;
  expiresAt: string;
  error?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
