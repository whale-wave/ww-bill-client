import type { PublicMediaUrlVariant } from '@ww-bill/bill-core';
import { isPublicMediaPath, resolvePublicMediaPath } from '@ww-bill/bill-core';

export type { PublicMediaUrlVariant } from '@ww-bill/bill-core';

/** Web owns environment and browser origin; reference parsing is shared. */
export function resolvePublicMediaUrl(value?: string | null, variant: PublicMediaUrlVariant = 'main-v1'): string | null {
  const path = resolvePublicMediaPath(value, variant);
  if (!path || !isPublicMediaPath(path))
    return path;
  const host = typeof import.meta.env.VITE_HOST === 'string' ? import.meta.env.VITE_HOST.trim() : '';
  if (host) {
    try {
      return new URL(path, host).toString();
    }
    catch {
      return path;
    }
  }
  return typeof window !== 'undefined' ? new URL(path, window.location.origin).toString() : path;
}
