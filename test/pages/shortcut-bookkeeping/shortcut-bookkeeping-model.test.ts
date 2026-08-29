import { describe, expect, it } from 'vitest';
import { LedgerRecordType } from '@/entities/ledger';
import {
  createShortcutRecordSeed,
  inferShortcutCategory,
  inferShortcutRecordType,
} from '@/features/record-editor';

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

  it('uses visible zero and a fallback remark when OCR has neither an amount nor a merchant', () => {
    const seed = createShortcutRecordSeed({
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-2',
      merchantCandidate: '',
      rawText: '无法可靠识别',
      source: 'UNKNOWN',
      status: 'NEEDS_REVIEW',
      warnings: ['AMOUNT_AMBIGUOUS'],
    }, LedgerRecordType.INCOME);

    expect(seed.amount).toBe('0');
    expect(seed.remark).toBe('无法可靠识别');
    expect(seed.recordType).toBe(LedgerRecordType.INCOME);
  });

  it('falls back to a standalone signed OCR amount when the server candidate is missing', () => {
    expect(createShortcutRecordSeed({
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-amount-fallback',
      merchantCandidate: '中国联合网络通信有限公司',
      rawText: '账单\n中国联通\n− 100.00\n当前状态\n支付成功',
      source: 'WECHAT',
      status: 'NEEDS_REVIEW',
      warnings: ['AMOUNT_MISSING'],
    }, LedgerRecordType.EXPENSE)).toMatchObject({
      amount: '100.00',
      remark: '中国联合网络通信有限公司',
    });
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

    expect(seed.amount).toBe('0');
  });

  it('finds a plausible amount and nearby descriptive remark in an unknown order layout', () => {
    expect(createShortcutRecordSeed({
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-unknown-order',
      merchantCandidate: '',
      rawText: '全部订单\n灵感工作室\n服务费 36\n流水号 2026082112065785287',
      source: 'UNKNOWN',
      status: 'NEEDS_REVIEW',
      warnings: ['SOURCE_UNKNOWN'],
    }, LedgerRecordType.EXPENSE)).toMatchObject({
      amount: '36',
      remark: '灵感工作室',
    });
  });

  it('infers the record type and one matching existing category from payment OCR', () => {
    const draft = {
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-4',
      merchantCandidate: '滴滴出行',
      rawText: '微信支付\\n滴滴出行\\n支付成功',
      source: 'WECHAT' as const,
      status: 'NEEDS_REVIEW' as const,
      warnings: [],
    };
    const categories = [
      { icon: 'catering', id: 1, name: '餐饮', type: 'sub' as const },
      { icon: 'traffic', id: 3, name: '交通', type: 'sub' as const },
    ];

    expect(inferShortcutRecordType(draft)).toBe(LedgerRecordType.EXPENSE);
    expect(inferShortcutCategory(categories, draft)).toEqual(categories[1]);
  });

  it('uses the everyday fallback category when OCR has no reliable category signal', () => {
    const draft = {
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-5',
      merchantCandidate: '未知商户',
      rawText: '付款成功',
      source: 'WECHAT' as const,
      status: 'NEEDS_REVIEW' as const,
      warnings: [],
    };

    const categories = [
      { icon: 'catering', id: 1, name: '餐饮', type: 'sub' as const },
      { icon: 'daily', id: 2, name: '日用', type: 'sub' as const },
      { icon: 'traffic', id: 2, name: '交通', type: 'sub' as const },
    ];

    expect(inferShortcutCategory(categories, draft)).toEqual(categories[1]);
  });
});
