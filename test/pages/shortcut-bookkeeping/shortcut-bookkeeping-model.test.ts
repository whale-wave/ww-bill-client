import { describe, expect, it } from 'vitest';
import { LedgerRecordType } from '@/entities/ledger';
import { createShortcutRecordSeed } from '@/pages/shortcut-bookkeeping-confirm/model';

describe('shortcut bookkeeping confirmation model', () => {
  it('prefills only trustworthy OCR candidates for manual review', () => {
    expect(createShortcutRecordSeed({
      amountCandidate: '18.60',
      capturedAt: '2026-08-29T10:00:00.000Z',
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-1',
      merchantCandidate: '鲸鱼便利店',
      rawText: '微信支付\n支付金额 ￥18.60\n收款方 鲸鱼便利店',
      source: 'WECHAT',
      status: 'NEEDS_REVIEW',
      warnings: [],
    }, LedgerRecordType.EXPENSE)).toEqual({
      amount: '18.60',
      recordType: LedgerRecordType.EXPENSE,
      remark: '鲸鱼便利店',
      time: '2026-08-29T10:00:00.000Z',
    });
  });

  it('leaves ambiguous or invalid amounts empty for user input', () => {
    const seed = createShortcutRecordSeed({
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-2',
      merchantCandidate: '',
      rawText: '无法可靠识别',
      source: 'UNKNOWN',
      status: 'NEEDS_REVIEW',
      warnings: ['AMOUNT_AMBIGUOUS'],
    }, LedgerRecordType.INCOME);

    expect(seed).not.toHaveProperty('amount');
    expect(seed.remark).toBe('');
    expect(seed.recordType).toBe(LedgerRecordType.INCOME);
  });

  it('never converts candidate amounts through floating point or exponent notation', () => {
    const seed = createShortcutRecordSeed({
      amountCandidate: '1e3',
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-3',
      merchantCandidate: '测试商户',
      rawText: '支付金额 1e3',
      source: 'UNKNOWN',
      status: 'NEEDS_REVIEW',
      warnings: [],
    }, LedgerRecordType.EXPENSE);

    expect(seed).not.toHaveProperty('amount');
  });
});
