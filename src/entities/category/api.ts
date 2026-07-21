import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface CategoryEntity {
  createdAt: string;
  icon: string;
  id: number;
  name: string;
  type: CategoryAmountType;
  updatedAt: string;
  ledgerId?: string;
}

export interface GetCategoryApiParams {
  type: CategoryAmountType;
}

export interface GetCategoryApiResponseData {
  count: number;
  data: CategoryEntity[];
}

export type CategoryAmountType = 'add' | 'sub';

export function getCategoryApi(params: GetCategoryApiParams = {
  type: 'sub',
}) {
  return request.get<unknown, SuccessResponse<GetCategoryApiResponseData>>(`/category`, {
    params,
  });
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
  name: string;
  type: CategoryAmountType;
  file: File;
}

export function postLedgerCategoryApi(
  ledgerId: string,
  data: PostLedgerCategoryApiData,
) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('type', data.type);
  formData.append('file', data.file);
  return request.post<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories`,
    formData,
  );
}

export interface PutLedgerCategoryApiData {
  name?: string;
  type?: CategoryAmountType;
  icon?: string;
}

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

export function deleteLedgerCategoryApi(ledgerId: string, categoryId: number) {
  return request.delete<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/categories/${encodeURIComponent(categoryId)}`,
  );
}
