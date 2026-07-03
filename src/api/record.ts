import { request } from '@/shared/api';

export interface RecordEntry {
  amount: string;
  category: {
    createdAt: string;
    icon: string;
    id: number;
    name: string;
    updatedAt: string;
  };
  createdAt: string;
  id: number;
  remark: string;
  time: string;
  type: 'sub' | 'add';
  updatedAt: string;
}

export interface GetRecordByIdApiParams {
  id: string;
}

export function getRecordByIdApi(getRecordByIdApiParams: GetRecordByIdApiParams) {
  return request.get<unknown, SuccessResponse<RecordEntry>>(`/record/${getRecordByIdApiParams.id}`);
}

export interface GetRecordApiResponseData {
  total: number;
  data: RecordEntry[];
  expend: number;
  income: number;
}

export interface GetRecordApiParams {
  startDate?: string | number;
  endDate?: string;
  keyword?: string;
}

// 获取记录
export function getRecordApi(params?: GetRecordApiParams) {
  return request.get<unknown, SuccessResponse<GetRecordApiResponseData>>(
    '/record',
    {
      params,
    },
  );
}

interface PostRecordApiData {
  remark: string;
  categoryId: number;
  type: string;
  amount: string;
  time: string;
}

// 创建记录
export function postRecordApi(data: PostRecordApiData) {
  return request.post<unknown, SuccessResponse<undefined>>(`/record`, data);
}

export interface PutRecordApiData extends PostRecordApiData {}

// 更新记录
export function putRecordApi(id: string, data: PutRecordApiData) {
  return request.put<unknown, SuccessResponse<undefined>>(
    `/record/${id}`,
    data,
  );
}

// 删除记录
export function deleteRecordApi(id: string) {
  return request.delete<unknown, SuccessResponse<undefined>>(`/record/${id}`);
}

export interface Bill {
  income: number;
  expand: number;
  balance: number;
}

export interface GetRecordBillApiParams {
  type: 'all' | 'year';
  year?: number;
}

export interface GetRecordBillApiResponseData {
  list: {
    [monthOrYear: string]: Bill;
  };
  all: Bill;
}

// 获取账单
export function getRecordBillApi(params: GetRecordBillApiParams) {
  return request.get<unknown, SuccessResponse<GetRecordBillApiResponseData>>(
    `/record/bill`,
    {
      params,
    },
  );
}
