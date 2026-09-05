export function formatAmount(amount: number) {
  return amount.toFixed(2);
}

/**
 * Keeps dense metric cards legible without discarding the magnitude of a
 * balance. Full precision remains available on detail pages.
 */
export function formatCompactAmount(amount: number) {
  if (!Number.isFinite(amount))
    return '--';

  const absoluteAmount = Math.abs(amount);
  if (absoluteAmount < 10000)
    return formatAmount(amount);

  const precision = absoluteAmount >= 100000 ? 1 : 2;
  const value = Number.parseFloat(
    (absoluteAmount / 10000).toFixed(precision),
  ).toString();
  return `${amount < 0 ? '-' : ''}${value}万`;
}

export function normalizeAmount(value: string, preValue: string) {
  if (value.startsWith('.')) {
    return '0.';
  }

  let normalizedValue = value.replace(/[^\d.]/g, ''); // Remove non-numeric and non-dot characters
  const parts = normalizedValue.split('.');

  if (parts.length > 2) {
    return preValue;
  }

  if (parts[1]?.length > 2) {
    return preValue;
  }

  if (parts[0].length > 1 && parts[0].startsWith('0')) {
    parts[0] = parts[0].replace(/^0+/, '');
    if (parts[0] === '') {
      parts[0] = '0';
    }
    normalizedValue = parts.join('.');
  }

  return normalizedValue;
}
