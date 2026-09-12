const PUBLIC_MEDIA_PATH_PATTERN = /^\/api\/media\/public\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/(?:avatar-v1|main-v1)$/i;

/** Resolve a server-provided site media path for both web and native builds. */
export function resolvePublicMediaUrl(value?: string | null): string | null {
  const normalized = value?.trim() || null;
  if (!normalized || !PUBLIC_MEDIA_PATH_PATTERN.test(normalized))
    return normalized;

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
