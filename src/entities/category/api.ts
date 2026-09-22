import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export type CategoryAmountType = 'add' | 'sub';
export type CategoryStatus = 'ACTIVE' | 'ARCHIVED';
export type CategoryIconType = 'BUILTIN' | 'IMAGE';

export interface CategoryEntity {
  createdAt: string;
  icon: string;
  iconType: CategoryIconType;
  id: number;
  isCustom: boolean;
  ledgerId: string;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
  path?: string;
  sortOrder: number;
  status: CategoryStatus;
  textIconEnabled?: boolean;
  textIconIndex?: number;
  templateKey?: string | null;
  type: CategoryAmountType;
  updatedAt: string;
  version: number;
}

export interface GetCategoryApiParams {
  status?: CategoryStatus | 'ALL';
  type: CategoryAmountType;
}

export interface GetCategoryApiResponseData {
  count?: number;
  data: CategoryEntity[];
  total: number;
}

export interface CategoryIconCatalogItem {
  group: 'food' | 'life' | 'family' | 'social' | 'income' | 'other';
  key: string;
  name: { en: string; zh: string };
}

export function getCategoryApi(params: GetCategoryApiParams = { type: 'sub' }) {
  return request.get<unknown, SuccessResponse<GetCategoryApiResponseData>>('/category', { params });
}

export function getCategoryIconCatalogApi() {
  return request.get<unknown, SuccessResponse<CategoryIconCatalogItem[]>>(
    '/category/icon-catalog',
  );
}

export function getLedgerCategoriesApi(
  ledgerId: string,
  params?: Partial<GetCategoryApiParams>,
) {
  return request.get<unknown, SuccessResponse<GetCategoryApiResponseData>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories`,
    { params },
  );
}

export interface PostLedgerCategoryApiData {
  parentId?: number | null;
  file?: File;
  iconKey?: string;
  name: string;
  type: CategoryAmountType;
  textIconEnabled?: boolean;
  textIconIndex?: number;
}

export function postLedgerCategoryApi(
  ledgerId: string,
  data: PostLedgerCategoryApiData,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('type', data.type);
  if (data.parentId)
    formData.append('parentId', String(data.parentId));
  if (data.iconKey)
    formData.append('iconKey', data.iconKey);
  if (data.file)
    formData.append('file', data.file);
  if (data.textIconEnabled !== undefined)
    formData.append('textIconEnabled', String(data.textIconEnabled));
  if (data.textIconIndex !== undefined)
    formData.append('textIconIndex', String(data.textIconIndex));
  return request.post<unknown, SuccessResponse<CategoryEntity>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories`,
    formData,
    {
      onUploadProgress: (event) => {
        const progress = event.progress
          ?? (event.total ? event.loaded / event.total : 0);
        onProgress?.(Math.max(0, Math.min(1, progress)));
      },
    },
  );
}

export interface PatchLedgerCategoryApiData {
  iconKey?: string;
  name?: string;
  status?: CategoryStatus;
  version: number;
  textIconEnabled?: boolean;
  textIconIndex?: number;
}

export function patchLedgerCategoryApi(
  ledgerId: string,
  categoryId: number,
  data: PatchLedgerCategoryApiData,
) {
  return request.patch<unknown, SuccessResponse<CategoryEntity>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories/${encodeURIComponent(categoryId)}`,
    data,
  );
}

export interface ReorderLedgerCategoriesApiData {
  parentId?: number | null;
  items: Array<{ categoryId: number; version: number }>;
  type: CategoryAmountType;
}

export function reorderLedgerCategoriesApi(
  ledgerId: string,
  data: ReorderLedgerCategoriesApiData,
) {
  return request.patch<unknown, SuccessResponse<CategoryEntity[]>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories/order`,
    data,
  );
}

export function uploadLedgerCategoryIconApi(
  ledgerId: string,
  categoryId: number,
  file: File,
  version: number,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('version', String(version));
  return request.post<unknown, SuccessResponse<CategoryEntity>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories/${encodeURIComponent(categoryId)}/icon`,
    formData,
    {
      onUploadProgress: (event) => {
        const progress = event.progress
          ?? (event.total ? event.loaded / event.total : 0);
        onProgress?.(Math.max(0, Math.min(1, progress)));
      },
    },
  );
}

/** @deprecated Kept while old callers migrate to the versioned PATCH contract. */
export type PutLedgerCategoryApiData = Omit<PatchLedgerCategoryApiData, 'version'> & {
  icon?: string;
  type?: CategoryAmountType;
  version?: number;
};

export function putLedgerCategoryApi(
  ledgerId: string,
  categoryId: number,
  data: PutLedgerCategoryApiData,
) {
  return request.put<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories/${encodeURIComponent(categoryId)}`,
    data,
  );
}

/** @deprecated DELETE now archives and exists only for old clients. */
export function deleteLedgerCategoryApi(
  ledgerId: string,
  categoryId: number,
  version?: number,
) {
  const path = `/ledgers/${encodeURIComponent(ledgerId)}/categories/${encodeURIComponent(categoryId)}`;
  return version == null
    ? request.delete<unknown, SuccessResponse<undefined>>(path)
    : request.delete<unknown, SuccessResponse<undefined>>(path, {
        params: { version },
      });
}

export interface CategoryMovePreview {
  categoryId: number;
  parentId: number | null;
  path: string;
  recordCount: number;
  version: number;
}

export function moveLedgerCategoryApi(ledgerId: string, categoryId: number, data: { parentId: number | null; version: number }, preview = false) {
  return request.post<unknown, SuccessResponse<CategoryMovePreview>>(`/ledgers/${encodeURIComponent(ledgerId)}/categories/${categoryId}/${preview ? 'move-preview' : 'move'}`, data);
}
