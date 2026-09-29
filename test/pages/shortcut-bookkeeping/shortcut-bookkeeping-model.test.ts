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

  it('uses the product description instead of the merchant on a column-read bill detail', () => {
    const seed = createShortcutRecordSeed({
      amountCandidate: '19.80',
      expiresAt: '2026-09-25T03:23:02.037Z',
      id: 'product-description-draft',
      merchantCandidate: '淘宝闪购',
      rawText: '全部账单\n支付时间\n付款方式\n商品说明\n支付奖励\n订单号\n商家订单号\n闪购\n淘宝闪购\n-19.80\n交易成功\n2026-09-22 11:51:14\n余额宝＞\n兰州牛肉面（淘宝超省节店）外卖订单\nv 立即领取2积分\n2026092223001196881409803847',
      source: 'UNKNOWN',
      status: 'CLAIMED',
      warnings: ['SOURCE_UNKNOWN'],
    }, LedgerRecordType.EXPENSE);

    expect(seed).toMatchObject({
      amount: '19.80',
      remark: '兰州牛肉面（淘宝超省节店）外卖订单',
    });
  });

  it('uses an inline product description when the bill labels and values stay together', () => {
    const seed = createShortcutRecordSeed({
      expiresAt: '2026-09-25T03:23:02.037Z',
      id: 'inline-product-description-draft',
      merchantCandidate: '淘宝闪购',
      rawText: '支付宝账单详情\n商品说明：兰州牛肉面外卖订单\n支付奖励：立即领取2积分',
      source: 'ALIPAY',
      status: 'CLAIMED',
      warnings: [],
    }, LedgerRecordType.EXPENSE);

    expect(seed.remark).toBe('兰州牛肉面外卖订单');
  });

  it('keeps the merchant when the product description value is missing', () => {
    const seed = createShortcutRecordSeed({
      expiresAt: '2026-09-25T03:23:02.037Z',
      id: 'missing-product-description-draft',
      merchantCandidate: '淘宝闪购',
      rawText: '商品说明\n支付奖励\n订单号\n交易成功\n2026-09-22 11:51:14\n余额宝＞\n立即领取2积分',
      source: 'UNKNOWN',
      status: 'CLAIMED',
      warnings: [],
    }, LedgerRecordType.EXPENSE);

    expect(seed.remark).toBe('淘宝闪购');
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

  it('does not use a status-bar battery number when no amount was recognized', () => {
    const seed = createShortcutRecordSeed({
      expiresAt: '2026-08-30T10:00:00.000Z',
      id: 'draft-status-bar',
      merchantCandidate: '',
      rawText: '08:34 1\n• 5C\n88\nSent by 小明',
      source: 'UNKNOWN',
      status: 'NEEDS_REVIEW',
      warnings: ['AMOUNT_MISSING'],
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

  it('corrects a previously claimed red packet draft with a battery amount candidate', () => {
    const draft = {
      amountCandidate: '88',
      expiresAt: '2026-09-25T02:06:34.670Z',
      id: 'red-packet-draft',
      merchantCandidate: '• 5C',
      rawText: '08:34 1\n• 5C\n88\nSent by 小明\n恭喜发财，大吉大利\n6.66 cr\nRed Packet transferred to Wallet ›\nReply with a sticker',
      source: 'UNKNOWN' as const,
      status: 'CLAIMED' as const,
      warnings: ['SOURCE_UNKNOWN'],
    };
    const categories = [
      { icon: 'other-money', id: 1, name: '其他', type: 'add' as const },
      { icon: 'red-envelope', id: 2, name: '红包', type: 'add' as const },
    ];

    const recordType = inferShortcutRecordType(draft);
    expect(recordType).toBe(LedgerRecordType.INCOME);
    expect(createShortcutRecordSeed(draft, recordType)).toMatchObject({
      amount: '6.66',
      recordType: LedgerRecordType.INCOME,
      remark: '小明的红包',
    });
    expect(inferShortcutCategory(categories, draft)).toEqual(categories[1]);
  });

  it('classifies a phone recharge payment as 通讯 despite unrelated promotion text', () => {
    const draft = {
      amountCandidate: '9.99',
      expiresAt: '2026-09-25T03:23:02.037Z',
      id: 'phone-recharge-draft',
      merchantCandidate: '支付成功',
      rawText: '16:47\n71\n支付成功\n·9.99\n本单共省0.01元\n支付方式\n中国建设银行\n极速支付 快人一步\n领18元话费抵扣券\n数字人民币话费福利\n领红包 充话费 享立减',
      source: 'UNKNOWN' as const,
      status: 'CLAIMED' as const,
      warnings: ['SOURCE_UNKNOWN'],
    };
    const categories = [
      { icon: 'red-envelope', id: 1, name: '红包', type: 'sub' as const },
      { icon: 'communication', id: 2, name: '通讯', type: 'sub' as const },
      { icon: 'daily', id: 3, name: '日用', type: 'sub' as const },
    ];

    expect(inferShortcutRecordType(draft)).toBe(LedgerRecordType.EXPENSE);
    expect(inferShortcutCategory(categories, draft)).toEqual(categories[1]);
  });

  it('does not classify an identified merchant as 通讯 because of phone bill promotions', () => {
    const draft = {
      expiresAt: '2026-09-25T03:23:02.037Z',
      id: 'other-payment-draft',
      merchantCandidate: '滴滴出行',
      rawText: '滴滴出行\n支付成功\n¥9.99\n领话费抵扣券\n充话费享立减',
      source: 'UNKNOWN' as const,
      status: 'CLAIMED' as const,
      warnings: [],
    };
    const categories = [
      { icon: 'traffic', id: 1, name: '交通', type: 'sub' as const },
      { icon: 'communication', id: 2, name: '通讯', type: 'sub' as const },
    ];

    expect(inferShortcutCategory(categories, draft)).toEqual(categories[0]);
  });
});
