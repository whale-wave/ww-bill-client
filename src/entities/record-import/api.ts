import type { SuccessResponse } from '@/shared/api';
import { assertSuccessApi, request } from '@/shared/api';

export type SharkAssetMode = 'NONE' | 'UNRESOLVED' | 'LINK_ONLY' | 'POST';

export interface SharkImportRow {
  sourceRow: number;
  include: boolean;
  date: string;
  type: 'add' | 'sub' | '';
  categoryName: string;
  categoryId: number | null;
  sourceAccount: string;
  amount: string;
  remark: string;
  tagNames: string[];
  assetId: string | null;
  assetMode: SharkAssetMode;
  issues: Array<{ field: string; message: string }>;
  warnings: string[];
}

export interface SharkImportPreview {
  id: string;
  revision: number;
  status: 'DRAFT' | 'COMMITTED';
  expiresAt: string;
  rows: SharkImportRow[];
  assets: Array<{ id: string; name: string; cardId?: string; groupName?: string }>;
  summary: {
    included: number;
    income: string;
    expense: string;
    newCategories: number;
    newTags: number;
    problems: number;
    linked: number;
    posted: number;
    linkOnly: number;
  };
  result: SharkImportResult | null;
}

export interface SharkImportResult {
  imported: number;
  skipped: number;
  recordIds: number[];
}

export type SharkImportDraftRow = Pick<SharkImportRow, 'sourceRow' | 'include' | 'date' | 'type' | 'categoryName' | 'amount' | 'remark' | 'tagNames' | 'assetId' | 'assetMode'>;

const base = (ledgerId: string) => `/ledgers/${encodeURIComponent(ledgerId)}/record-imports/shark`;

export async function uploadSharkImport(ledgerId: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return assertSuccessApi(await request.post<unknown, SuccessResponse<SharkImportPreview>>(
    `${base(ledgerId)}/preview`,
    body,
  )).data;
}

export async function getSharkImport(ledgerId: string, batchId: string) {
  return assertSuccessApi(await request.get<unknown, SuccessResponse<SharkImportPreview>>(
    `${base(ledgerId)}/${encodeURIComponent(batchId)}`,
  )).data;
}

export async function saveSharkImportDraft(ledgerId: string, batchId: string, revision: number, rows: SharkImportDraftRow[]) {
  return assertSuccessApi(await request.put<unknown, SuccessResponse<SharkImportPreview>>(
    `${base(ledgerId)}/${encodeURIComponent(batchId)}/draft`,
    { revision, rows },
  )).data;
}

export async function commitSharkImport(ledgerId: string, batchId: string, revision: number) {
  return assertSuccessApi(await request.post<unknown, SuccessResponse<SharkImportResult>>(
    `${base(ledgerId)}/${encodeURIComponent(batchId)}/commit`,
    { revision },
  )).data;
}
