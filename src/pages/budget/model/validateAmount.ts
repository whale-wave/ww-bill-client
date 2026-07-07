import { isNaN } from 'mathjs';
import { i18n } from '@/shared/i18n';

export type AmountError = 'required' | 'zero' | 'invalid' | 'maxDigits' | 'maxDecimals';

const ERROR_MAP: Record<AmountError, string> = {
  required: i18n.t('budget:validation.amountRequired'),
  zero: i18n.t('budget:validation.amountCannotBeZero'),
  invalid: i18n.t('budget:validation.invalidAmount'),
  maxDigits: i18n.t('budget:validation.maxDigits'),
  maxDecimals: i18n.t('budget:validation.maxDecimals'),
};

export function validateAmount(raw: string): AmountError | null {
  if (!raw)
    return 'required';
  if (Number(raw) === 0)
    return 'zero';

  const dots = raw.split('').filter(s => s === '.');
  if (dots.length > 1)
    return 'invalid';

  const [before, after] = raw.split('.');

  if (!before)
    return 'invalid';
  if (isNaN(Number(before)))
    return 'invalid';
  if (before.length > 9)
    return 'maxDigits';

  if (after) {
    if (isNaN(Number(after)))
      return 'invalid';
    if (after.length > 2)
      return 'maxDecimals';
  }

  return null;
}

/** Normalize amount string (strip trailing dot). */
export function normalizeAmount(raw: string): string {
  if (raw.lastIndexOf('.') === raw.length - 1) {
    return raw.substring(0, raw.length - 1);
  }
  return raw;
}

export { ERROR_MAP };
