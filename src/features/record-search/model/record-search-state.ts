import type { GetHouseholdRecordsApiParams } from '@/entities/household';
import type { GetRecordApiParams, RecordKeywordTarget } from '@/entities/record';
import { FamilyRecordPolicy } from '@/entities/household';

export type RecordSearchMatch = RecordKeywordTarget;
export type RecordSearchType = 'all' | 'add' | 'sub';
export type FamilyCountingFilter = 'all' | 'counted' | 'uncounted';

export interface RecordSearchFilters {
  categoryIds: number[];
  endDate: string;
  familyCounting: FamilyCountingFilter;
  match: RecordSearchMatch;
  maxAmount: string;
  memberUserId: string;
  minAmount: string;
  startDate: string;
  tagIds: string[];
  type: RecordSearchType;
}

export interface RecordSearchState {
  filters: RecordSearchFilters;
  keyword: string;
}

export interface RecordSearchValidation {
  amount?: string;
  amountRange?: string;
  date?: string;
}

const validMatches = new Set<RecordSearchMatch>([
  'all',
  'amount',
  'category',
  'remark',
  'tag',
]);
const validTypes = new Set<RecordSearchType>(['add', 'all', 'sub']);
const filterKeys = [
  'categoryIds',
  'countedOnly',
  'endDate',
  'match',
  'maxAmount',
  'memberUserId',
  'minAmount',
  'policy',
  'startDate',
  'tagIds',
  'type',
] as const;
const positiveAmountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const nonNegativeAmountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

function readNumberList(value: string | null) {
  return [...new Set(
    (value ?? '')
      .split(',')
      .map(Number)
      .filter(item => Number.isInteger(item) && item > 0),
  )].sort((left, right) => left - right);
}

function readStringList(value: string | null) {
  return [...new Set(
    (value ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean),
  )].sort();
}

function readFamilyCounting(searchParams: URLSearchParams): FamilyCountingFilter {
  if (searchParams.get('countedOnly') === 'true')
    return 'counted';
  const policy = searchParams.get('policy');
  if (policy === FamilyRecordPolicy.SHARED_UNCOUNTED)
    return 'uncounted';
  if (policy === FamilyRecordPolicy.INHERIT || policy === FamilyRecordPolicy.SHARED_COUNTED)
    return 'counted';
  return 'all';
}

export function readRecordSearchState(searchParams: URLSearchParams): RecordSearchState {
  const rawMatch = searchParams.get('match') as RecordSearchMatch | null;
  const rawType = searchParams.get('type') as RecordSearchType | null;
  const keyword = searchParams.get('q') ?? searchParams.get('keyword') ?? '';
  const normalizedKeyword = keyword.trim();
  return {
    filters: {
      categoryIds: readNumberList(searchParams.get('categoryIds')),
      endDate: searchParams.get('endDate') ?? '',
      familyCounting: readFamilyCounting(searchParams),
      match: normalizedKeyword && rawMatch && validMatches.has(rawMatch) ? rawMatch : 'all',
      maxAmount: searchParams.get('maxAmount') ?? '',
      memberUserId: searchParams.get('memberUserId') ?? '',
      minAmount: searchParams.get('minAmount') ?? '',
      startDate: searchParams.get('startDate') ?? '',
      tagIds: readStringList(searchParams.get('tagIds')),
      type: rawType && validTypes.has(rawType) ? rawType : 'all',
    },
    keyword,
  };
}

export function createRecordSearchParams(
  current: URLSearchParams,
  filters: RecordSearchFilters,
) {
  const next = new URLSearchParams(current);
  const keyword = (next.get('q') ?? next.get('keyword') ?? '').trim();
  next.delete('keyword');
  filterKeys.forEach(key => next.delete(key));
  if (keyword)
    next.set('q', keyword);
  else
    next.delete('q');
  if (keyword && filters.match !== 'all')
    next.set('match', filters.match);
  if (filters.type !== 'all')
    next.set('type', filters.type);
  if (filters.startDate)
    next.set('startDate', filters.startDate);
  if (filters.endDate)
    next.set('endDate', filters.endDate);
  if (filters.memberUserId)
    next.set('memberUserId', filters.memberUserId);
  if (filters.categoryIds.length)
    next.set('categoryIds', [...new Set(filters.categoryIds)].sort((a, b) => a - b).join(','));
  if (filters.tagIds.length)
    next.set('tagIds', [...new Set(filters.tagIds)].sort().join(','));
  if (filters.minAmount)
    next.set('minAmount', filters.minAmount);
  if (filters.maxAmount)
    next.set('maxAmount', filters.maxAmount);
  if (filters.familyCounting === 'counted')
    next.set('countedOnly', 'true');
  if (filters.familyCounting === 'uncounted')
    next.set('policy', FamilyRecordPolicy.SHARED_UNCOUNTED);
  return next;
}

function isValidDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match)
    return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3]);
}

function isPositiveAmount(value: string) {
  return positiveAmountPattern.test(value) && Number(value) > 0;
}

export function validateRecordSearchState({
  filters,
  keyword,
}: RecordSearchState): RecordSearchValidation {
  const validation: RecordSearchValidation = {};
  const normalizedKeyword = keyword.trim();
  if (normalizedKeyword && filters.match === 'amount' && !isPositiveAmount(normalizedKeyword))
    validation.amount = '请输入大于 0、最多两位小数的金额';
  if (
    (filters.startDate && !isValidDateOnly(filters.startDate))
    || (filters.endDate && !isValidDateOnly(filters.endDate))
  ) {
    validation.date = '请选择有效日期';
  }
  else if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    validation.date = '开始日期不能晚于结束日期';
  }
  const isInvalidMin = filters.minAmount
    && (!nonNegativeAmountPattern.test(filters.minAmount) || Number(filters.minAmount) < 0);
  const isInvalidMax = filters.maxAmount
    && (!nonNegativeAmountPattern.test(filters.maxAmount) || Number(filters.maxAmount) < 0);
  if (isInvalidMin || isInvalidMax) {
    validation.amountRange = '金额区间仅支持非负数和两位小数';
  }
  else if (
    filters.minAmount
    && filters.maxAmount
    && Number(filters.minAmount) > Number(filters.maxAmount)
  ) {
    validation.amountRange = '最小金额不能大于最大金额';
  }
  return validation;
}

export function isRecordSearchActive(state: RecordSearchState) {
  const { filters, keyword } = state;
  return Boolean(
    keyword.trim()
    || filters.type !== 'all'
    || filters.startDate
    || filters.endDate
    || filters.memberUserId
    || filters.categoryIds.length
    || filters.tagIds.length
    || filters.minAmount
    || filters.maxAmount
    || filters.familyCounting !== 'all',
  );
}

export function isRecordFilterActive(filters: RecordSearchFilters) {
  return Boolean(
    filters.type !== 'all'
    || filters.startDate
    || filters.endDate
    || filters.memberUserId
    || filters.categoryIds.length
    || filters.tagIds.length
    || filters.minAmount
    || filters.maxAmount
    || filters.familyCounting !== 'all',
  );
}

export function toCommonRecordSearchFilters(
  filters: RecordSearchFilters,
): RecordSearchFilters {
  return {
    ...filters,
    categoryIds: [],
    familyCounting: 'all',
    maxAmount: '',
    memberUserId: '',
    minAmount: '',
    tagIds: [],
  };
}

export function isCommonRecordSearchActive(state: RecordSearchState) {
  const filters = toCommonRecordSearchFilters(state.filters);
  return Boolean(
    state.keyword.trim()
    || filters.type !== 'all'
    || filters.startDate
    || filters.endDate,
  );
}

export function toRecordApiParams(
  state: RecordSearchState,
  keyword = state.keyword,
): GetRecordApiParams {
  const { filters } = state;
  const normalizedKeyword = keyword.trim();
  return {
    ...(normalizedKeyword ? { keyword: normalizedKeyword, keywordTarget: filters.match } : {}),
    ...(filters.type === 'all' ? {} : { type: filters.type }),
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
    ...(filters.startDate || filters.endDate ? { dateMode: 'range' as const } : {}),
  };
}

export function toHouseholdRecordApiParams(
  state: RecordSearchState,
  keyword = state.keyword,
): GetHouseholdRecordsApiParams {
  const { filters } = state;
  const normalizedKeyword = keyword.trim();
  return {
    ...(normalizedKeyword ? { keyword: normalizedKeyword, keywordTarget: filters.match } : {}),
    ...(filters.type === 'all' ? {} : { type: filters.type }),
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
    ...(filters.startDate || filters.endDate ? { dateMode: 'range' as const } : {}),
    ...(filters.memberUserId ? { memberUserId: Number(filters.memberUserId) } : {}),
    ...(filters.categoryIds.length ? { categoryIds: filters.categoryIds } : {}),
    ...(filters.tagIds.length ? { tagIds: filters.tagIds } : {}),
    ...(filters.minAmount ? { minAmount: filters.minAmount } : {}),
    ...(filters.maxAmount ? { maxAmount: filters.maxAmount } : {}),
    ...(filters.familyCounting === 'counted' ? { countedOnly: true } : {}),
    ...(filters.familyCounting === 'uncounted'
      ? { policy: FamilyRecordPolicy.SHARED_UNCOUNTED }
      : {}),
  };
}
