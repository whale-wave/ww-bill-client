import request from '@/utils/request';

export interface GetChartParams {
  type: string;
  category: string;
  categoryId?: string;
}

// export type CategoryAmountType = 'add' | 'sub';

export const getChartApi = (data: GetChartParams) => {
  return request.get<unknown, SuccessResponse<any>>(`/chart`, {
    params: {
      ...data,
    },
  });
};
