import { isPublicMediaPath, resolvePublicMediaPath, type PublicMediaUrlVariant } from '@ww-bill/bill-core'

declare const BILL_API_BASE_URL: string

/** Miniapp images cannot resolve an API path against the Web app's origin. */
export function resolvePublicMediaUrl(value?: string | null, variant: PublicMediaUrlVariant = 'main-v1') {
  const path = resolvePublicMediaPath(value, variant)
  if (!path || !isPublicMediaPath(path))
    return path
  const origin = typeof BILL_API_BASE_URL === 'string' ? BILL_API_BASE_URL.match(/^https?:\/\/[^/?#]+/i)?.[0] : undefined
  return origin ? `${origin}${path}` : path
}
