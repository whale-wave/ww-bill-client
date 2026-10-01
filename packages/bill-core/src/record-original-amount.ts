import { money } from './amount';

export function formatRecordOriginalAmount(type: 'add' | 'sub', originalAmount: string | number | null | undefined): string | undefined {
  return originalAmount
    ? `${type === 'sub' ? '-' : ''}${money.formatNatural(originalAmount)}`
    : undefined;
}
