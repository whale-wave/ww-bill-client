import { request } from '@/shared/api';

export interface CategoryEntity {
  createdAt: string;
  icon: string;
  id: number;
  name: string;
  type: CategoryAmountType;
  updatedAt: string;
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
