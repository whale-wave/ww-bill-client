import type { ShareData } from '@/pages/share/ShareCanvas';
import { i18n } from '@/shared/i18n';

type ShareSource = Record<string, unknown>;

function isObject(value: unknown): value is ShareSource {
  return typeof value === 'object' && value !== null;
}

function readString(source: ShareSource | undefined, keys: string[]): string {
  if (!source)
    return '';
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number')
      return String(value).trim();
  }
  return '';
}

function normalizeType(value: string): ShareData['type'] | '' {
  if (value === 'sub' || value === i18n.t('common:export.typeExpend'))
    return 'sub';
  if (value === 'add' || value === i18n.t('common:export.typeIncome'))
    return 'add';
  return '';
}

function formatDateText(value: string): string {
  if (!value)
    return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return i18n.t('common:dateTime.longDate', { year, month, day });
}

export function normalizeShareData(source: ShareSource | undefined): ShareData | null {
  const category = isObject(source?.category) ? source.category : undefined;
  const amount = readString(source, ['amount', 'money']);
  const type = normalizeType(readString(source, ['type']));
  const categoryName = readString(source, ['categoryName', 'category', 'typeName'])
    || readString(category, ['name']);
  const remark = readString(source, ['remark', 'desc', 'description']);
  const dateText = readString(source, ['dateText'])
    || formatDateText(readString(source, ['time', 'date']));

  if (!amount || !type || !categoryName)
    return null;

  return { amount, type, categoryName, remark, dateText: dateText || i18n.t('common:export.noDate') };
}

export function getSourceFromSearchParams(searchParams: URLSearchParams): ShareSource {
  return {
    amount: searchParams.get('amount') || '',
    type: searchParams.get('type') || '',
    categoryName: searchParams.get('categoryName') || searchParams.get('category') || '',
    remark: searchParams.get('remark') || '',
    dateText: searchParams.get('dateText') || '',
    time: searchParams.get('time') || searchParams.get('date') || '',
  };
}

export function buildShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    amount: data.amount,
    type: data.type,
    categoryName: data.categoryName,
    dateText: data.dateText,
  });
  if (data.remark)
    params.set('remark', data.remark);
  return `${window.location.origin}${window.location.pathname}#/share?${params.toString()}`;
}

export function isShareCancelError(error: unknown): boolean {
  if (!(error instanceof Error))
    return false;
  return error.name === 'AbortError'
    || error.name === 'NotAllowedError'
    || error.message.includes('AbortError')
    || error.message.includes('cancel');
}
