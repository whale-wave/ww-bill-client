import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface InvoiceEntity {
  id: string;
  companyName: string;
  taxNumber: string;
  companyAddress?: string;
  phone?: string;
  accountOpeningBank?: string;
  bankAccount?: string;
}

interface PostInvoiceApiData extends Omit<InvoiceEntity, 'id'> {
}

export function postInvoiceApi(data: PostInvoiceApiData) {
  return request.post<unknown, SuccessResponse<unknown>>('/invoice', data);
}

export function getInvoiceApi() {
  return request.get<unknown, SuccessResponse<InvoiceEntity[]>>('/invoice');
}

export interface GetInvoiceByIdApiParams {
  id: string;
}

export function getInvoiceByIdApi(params: GetInvoiceByIdApiParams) {
  return request.get<unknown, SuccessResponse<InvoiceEntity>>(`/invoice/${params.id}`);
}

export interface PatchInvoiceApiData extends Partial<Omit<InvoiceEntity, 'id'>> {
}

export function patchInvoiceApi(id: string, data: PatchInvoiceApiData) {
  return request.patch<unknown, SuccessResponse<unknown>>(`/invoice/${id}`, data);
}

export function deleteInvoiceApi(id: string) {
  return request.delete<unknown, SuccessResponse<unknown>>(`/invoice/${id}`);
}
