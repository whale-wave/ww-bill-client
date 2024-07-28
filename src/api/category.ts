import request from '@/utils/request';

export interface CategoryEntity {
  createdAt: string;
  icon: string;
  id: number;
  name: string;
  updatedAt: string;
}

export interface GetCategoryApiResponseData {
  count: number;
  data: CategoryEntity[];
}

export type CategoryAmountType = 'add' | 'sub';

export function getCategoryApi(type: CategoryAmountType = 'sub') {
  return request.get<unknown, SuccessResponse<GetCategoryApiResponseData>>(`/category`, {
    params: {
      type,
    },
  });
}
