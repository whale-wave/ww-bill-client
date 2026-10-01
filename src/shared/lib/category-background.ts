import { isDarkCategoryBackground } from '@ww-bill/bill-core';

export function getCategoryIconForegroundColor(backgroundColor: string | null | undefined): string | undefined {
  return isDarkCategoryBackground(backgroundColor) ? 'var(--ww-ref-mono-white)' : undefined;
}
