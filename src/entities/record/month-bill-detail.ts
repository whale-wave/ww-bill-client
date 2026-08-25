import type { MonthBillDetailResponse } from './api';

export type MonthBillDetailWireResponse = Omit<MonthBillDetailResponse, 'monthBillExportQrUrl'> & {
  monthBillExportQrUrl?: string;
};

export const DEFAULT_MONTH_BILL_EXPORT_QR_URL = 'https://github.com/whale-wave/ww-bill-client';

export function normalizeMonthBillDetail(value: MonthBillDetailWireResponse): MonthBillDetailResponse {
  const raw = value.monthBillExportQrUrl;
  if (raw === undefined)
    return { ...value, monthBillExportQrUrl: DEFAULT_MONTH_BILL_EXPORT_QR_URL };
  const trimmed = raw.trim();
  if (!trimmed)
    throw new Error('monthBillExportQrUrl is empty');
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  }
  catch {
    throw new Error('monthBillExportQrUrl is invalid');
  }
  if (parsed.protocol !== 'https:')
    throw new Error('monthBillExportQrUrl must use HTTPS');
  return { ...value, monthBillExportQrUrl: trimmed };
}
