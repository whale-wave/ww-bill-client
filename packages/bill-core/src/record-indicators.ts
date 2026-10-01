import type { MoneyInput } from './amount';
import { money } from './amount';

export interface RecordIndicatorSource {
  adjustmentSummary?: { refundAmount: MoneyInput; cashbackAmount: MoneyInput; supplementAmount: MoneyInput };
  attachments?: readonly unknown[];
  tags?: readonly { name: string }[];
}

export function getRecordIndicators(record: RecordIndicatorSource, formatAdjustment: (kind: 'refund' | 'cashback' | 'supplement', amount: MoneyInput) => string) {
  const summary = record.adjustmentSummary;
  const adjustmentSummary = summary
    ? (['refund', 'cashback', 'supplement'] as const).map((kind) => {
        const amount = summary[`${kind}Amount`];
        return money.compare(amount, 0) > 0 ? formatAdjustment(kind, amount) : undefined;
      }).filter(Boolean).join(' · ')
    : undefined;
  return {
    adjustmentSummary,
    hasAttachment: Boolean(record.attachments?.length),
    tagSummary: record.tags?.map(tag => `#${tag.name}`).join(' ') || undefined,
  };
}
