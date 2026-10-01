import type { CSSProperties } from 'react';

/** Text and emoji hosts share geometry; image loading stays in each platform. */
export function categoryIconTextStyle(kind: 'text' | 'emoji', size: number | string): CSSProperties {
  return {
    alignItems: 'center',
    display: 'inline-flex',
    fontSize: kind === 'text' ? (typeof size === 'number' ? Math.max(12, Math.round(size * 0.82)) : undefined) : size,
    ...(kind === 'text' ? { fontWeight: 800 } : {}),
    height: size,
    justifyContent: 'center',
    lineHeight: 1,
    width: size,
  };
}
