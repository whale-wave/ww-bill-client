const PUBLIC_MEDIA_PATH_PATTERN = /^\/api\/media\/public\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/(?:avatar-v1|main-v1)$/i;
const PUBLIC_MEDIA_REFERENCE_PATTERN = /^media:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export type PublicMediaUrlVariant = 'avatar-v1' | 'main-v1';

export function isPublicMediaPath(value: string): boolean {
  return PUBLIC_MEDIA_PATH_PATTERN.test(value);
}

/** Normalize the shared media reference; the host supplies its own origin. */
export function resolvePublicMediaPath(value?: string | null, variant: PublicMediaUrlVariant = 'main-v1'): string | null {
  const normalized = value?.trim() || null;
  if (!normalized)
    return null;
  const match = PUBLIC_MEDIA_REFERENCE_PATTERN.exec(normalized);
  return match ? `/api/media/public/${match[1]}/${variant}` : normalized;
}
