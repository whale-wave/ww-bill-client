import { getRecordIndicators } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';
import { getRecordListIndicators } from '@/entities/record/ui/recordPresentationMappers';
import { i18n } from '@/shared/i18n';

describe('shared record indicators', () => {
  it('keeps adjustment order and precision while ignoring zero amounts', () => {
    const source = { adjustmentSummary: { refundAmount: '7.00', cashbackAmount: '0.00', supplementAmount: '1.20' }, tags: [{ name: '午餐' }, { name: '共同支出' }], attachments: [{}] };
    const result = getRecordIndicators(source, (kind, amount) => `${kind}:${amount}`);
    expect(result).toEqual({ adjustmentSummary: 'refund:7.00 · supplement:1.20', tagSummary: '#午餐 #共同支出', hasAttachment: true });
    expect(getRecordListIndicators(source)).toEqual(getRecordIndicators(source, (kind, amount) => i18n.t(`adjustment.${kind}WithAmount`, { amount, ns: 'record' })));
  });

  it('leaves missing metadata empty without creating a secondary line', () => {
    expect(getRecordIndicators({}, () => 'unused')).toEqual({ adjustmentSummary: undefined, tagSummary: undefined, hasAttachment: false });
  });
});
