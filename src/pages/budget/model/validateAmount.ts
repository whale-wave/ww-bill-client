import { isNaN } from 'mathjs';

export type AmountError = 'required' | 'zero' | 'invalid' | 'maxDigits' | 'maxDecimals';

const ERROR_MAP: Record<AmountError, string> = {
  required: '请输入金额',
  zero: '预算不能为 0',
  invalid: '请输入正确的金额',
  maxDigits: '最多 9 位数字',
  maxDecimals: '最多 2 位小数',
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
