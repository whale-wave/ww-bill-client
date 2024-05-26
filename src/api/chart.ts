import request from '@/utils/request';

// export type iconObj = {
//   createdAt: string;
//   icon: string;
//   id: number;
//   name: string;
//   updatedAt: string;
// };
//
// export type iconType = {
//   count: number;
//   data: iconObj[];
// };

// export type CategoryAmountType = 'add' | 'sub';

export const chartListApi = (data: any) => {
  return request.get<unknown, SuccessResponse<any>>(`/chart`, {
    params: {
      ...data,
    },
  });
};
