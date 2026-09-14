const PUBLIC_MEDIA_PATH_PATTERN = /^\/api\/media\/public\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/(?:avatar-v1|main-v1)$/i;
const PUBLIC_MEDIA_REFERENCE_PATTERN = /^media:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export type PublicMediaUrlVariant = 'avatar-v1' | 'main-v1';

/** Resolve a server-provided site media path for both web and native builds. */
export function resolvePublicMediaUrl(value?: string | null, variant: PublicMediaUrlVariant = 'main-v1'): string | null {
  const normalized = value?.trim() || null;
  if (!normalized || !PUBLIC_MEDIA_PATH_PATTERN.test(normalized))
    return resolvePublicMediaReference(normalized, variant);

  const host = typeof import.meta.env.VITE_HOST === 'string'
    ? import.meta.env.VITE_HOST.trim()
    : '';
  if (host) {
    try {
      return new URL(normalized, host).toString();
    }
    catch {
      return normalized;
    }
  }

  if (typeof window !== 'undefined')
    return new URL(normalized, window.location.origin).toString();
  return normalized;
}

function resolvePublicMediaReference(value: string | null, variant: PublicMediaUrlVariant): string | null {
  if (!value)
    return null;
  const match = PUBLIC_MEDIA_REFERENCE_PATTERN.exec(value);
  if (!match)
    return value;

  const path = `/api/media/public/${match[1]}/${variant}`;
  const host = typeof import.meta.env.VITE_HOST === 'string'
    ? import.meta.env.VITE_HOST.trim()
    : '';
  if (host) {
    try {
      return new URL(path, host).toString();
    }
    catch {
      return path;
    }
  }

  if (typeof window !== 'undefined')
    return new URL(path, window.location.origin).toString();
  return path;
}
