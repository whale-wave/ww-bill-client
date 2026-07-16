import { describe, expect, it } from 'vitest';
import {
  buildShareUrl,
  getSourceFromSearchParams,
  isShareCancelError,
  normalizeShareData,
} from '@/pages/share/model/shareUtils';
import { i18n } from '@/shared/i18n';

describe('share utilities', () => {
  it('normalizes a record-shaped source', () => {
    expect(normalizeShareData({
      amount: '88.00',
      type: 'sub',
      category: { name: '餐饮' },
      remark: '午餐',
      dateText: '2026-07-16',
    })).toEqual({
      amount: '88.00',
      type: 'sub',
      categoryName: '餐饮',
      remark: '午餐',
      dateText: '2026-07-16',
    });
  });

  it('formats a record time when dateText is absent', () => {
    expect(normalizeShareData({
      amount: '88.00',
      type: 'sub',
      category: { name: '餐饮' },
      time: '2026-07-16 12:30:00',
    })).toEqual({
      amount: '88.00',
      type: 'sub',
      categoryName: '餐饮',
      remark: '',
      dateText: i18n.t('common:dateTime.longDate', {
        year: 2026,
        month: '07',
        day: '16',
      }),
    });
  });

  it('rejects incomplete share data', () => {
    expect(normalizeShareData({ amount: '88.00', type: 'sub' })).toBeNull();
  });

  it('reads query parameters and builds a copyable URL', () => {
    const source = getSourceFromSearchParams(new URLSearchParams(
      'amount=88.00&type=sub&categoryName=%E9%A4%90%E9%A5%AE&dateText=2026-07-16',
    ));
    const data = normalizeShareData(source);
    expect(data).not.toBeNull();
    expect(buildShareUrl(data!)).toContain('#/share?amount=88.00&type=sub');
  });

  it('recognizes browser share cancellation', () => {
    const error = new Error('cancel');
    error.name = 'AbortError';
    expect(isShareCancelError(error)).toBe(true);
    expect(isShareCancelError(new Error('network failed'))).toBe(false);
  });
});
