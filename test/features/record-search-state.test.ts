import { describe, expect, it } from 'vitest';
import {
  createRecordSearchParams,
  isCommonRecordSearchActive,
  isRecordSearchActive,
  readRecordSearchState,
  toCommonRecordSearchFilters,
  toHouseholdRecordApiParams,
  toRecordApiParams,
  validateRecordSearchState,
} from '@/features/record-search';

describe('record search URL state', () => {
  it('reads legacy keyword links and normalizes invalid enums', () => {
    const state = readRecordSearchState(new URLSearchParams(
      'keyword=%E5%8D%88%E9%A4%90&match=owner&type=other',
    ));
    expect(state.keyword).toBe('午餐');
    expect(state.filters.match).toBe('all');
    expect(state.filters.type).toBe('all');
  });

  it('writes stable canonical params and preserves the keyword on reset', () => {
    const current = new URLSearchParams(
      'keyword=old&q=lunch&match=tag&type=sub&categoryIds=3,2,3&countedOnly=true',
    );
    const next = createRecordSearchParams(current, {
      categoryIds: [],
      endDate: '',
      familyCounting: 'all',
      match: 'all',
      maxAmount: '',
      memberUserId: '',
      minAmount: '',
      startDate: '',
      tagIds: [],
      type: 'all',
    });
    expect(next.toString()).toBe('q=lunch');
  });

  it('maps legacy household policies to the non-conflicting family counting control', () => {
    expect(readRecordSearchState(new URLSearchParams('policy=SHARED_UNCOUNTED')).filters.familyCounting).toBe('uncounted');
    expect(readRecordSearchState(new URLSearchParams('policy=SHARED_UNCOUNTED&countedOnly=true')).filters.familyCounting).toBe('counted');
    expect(readRecordSearchState(new URLSearchParams('policy=PRIVATE')).filters.familyCounting).toBe('all');
  });

  it('validates range order and exact amount syntax before querying', () => {
    const base = readRecordSearchState(new URLSearchParams('q=-2&match=amount&startDate=2026-08-01&endDate=2026-07-01'));
    expect(validateRecordSearchState(base)).toEqual({
      amount: '请输入大于 0、最多两位小数的金额',
      date: '开始日期不能晚于结束日期',
    });
  });

  it('ignores household-only deep-link filters in personal and custom searches', () => {
    const state = readRecordSearchState(new URLSearchParams(
      'categoryIds=2,3&tagIds=tag-a&memberUserId=9&minAmount=1',
    ));
    expect(isCommonRecordSearchActive(state)).toBe(false);
    expect(toCommonRecordSearchFilters(state.filters)).toMatchObject({
      categoryIds: [],
      familyCounting: 'all',
      maxAmount: '',
      memberUserId: '',
      minAmount: '',
      tagIds: [],
    });
  });

  it('treats a whitespace-only keyword as empty across all adapters', () => {
    const state = readRecordSearchState(new URLSearchParams('q=%20%20&match=amount'));

    expect(isRecordSearchActive(state)).toBe(false);
    expect(isCommonRecordSearchActive(state)).toBe(false);
    expect(toRecordApiParams(state)).toEqual({});
    expect(toHouseholdRecordApiParams(state)).toEqual({});
    expect(createRecordSearchParams(new URLSearchParams('q=%20%20&match=amount'), state.filters).toString()).toBe('');
  });
});
