import type { CSSProperties, FC } from 'react';
import { useState } from 'react';
import { cn } from '@/shared/lib';
import { resolvePublicMediaUrl } from '@/shared/lib/public-media-url';
import { DesignIcon } from '../design-icon';
import { usePublicMediaObjectUrl } from '../public-media-image';

export interface UserAvatarProps {
  alt?: string;
  className?: string;
  fallback?: 'icon' | 'initial';
  name?: string | null;
  size?: number;
  src?: string | null;
  style?: CSSProperties;
  testId?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  alt = '',
  className,
  fallback = 'initial',
  name,
  size = 42,
  src,
  style,
  testId,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const normalizedSrc = src?.trim() || null;
  const resolvedSrc = resolvePublicMediaUrl(normalizedSrc, 'avatar-v1');
  const mediaState = usePublicMediaObjectUrl(resolvedSrc);
  const imageSrc = mediaState.url;
  const shouldFallback = !resolvedSrc || !imageSrc || failedSrc === resolvedSrc || mediaState.error;
  const initial = (name?.trim() || '?').slice(0, 1);
  const dimensionStyle: CSSProperties = {
    aspectRatio: '1 / 1',
    flex: 'none',
    height: size,
    maxHeight: size,
    maxWidth: size,
    minHeight: size,
    minWidth: size,
    width: size,
    ...style,
  };

  if (!shouldFallback) {
    return (
      <img
        alt={alt}
        className={cn('inline-flex aspect-square shrink-0 flex-none self-center overflow-hidden rounded-full object-cover', className)}
        data-user-avatar="image"
        data-avatar-type="image"
        data-testid={testId}
        height={size}
        onError={() => setFailedSrc(resolvedSrc)}
        src={imageSrc}
        style={dimensionStyle}
        width={size}
      />
    );
  }

  return fallback === 'icon'
    ? <span aria-label={alt} className={cn('ww-theme-icon-surface inline-flex aspect-square shrink-0 flex-none self-center items-center justify-center overflow-hidden rounded-full text-primary-deep', className)} data-avatar-type="fallback" data-user-avatar="fallback" data-testid={testId} style={dimensionStyle}><DesignIcon className="text-primary-deep" name="avatar-user" size={Math.round(size * 0.55)} /></span>
    : <span aria-label={alt} className={cn('ww-theme-icon-surface inline-flex aspect-square shrink-0 flex-none self-center items-center justify-center overflow-hidden rounded-full font-black text-primary-deep', className)} data-avatar-type="fallback" data-user-avatar="fallback" data-testid={testId} style={{ ...dimensionStyle, fontSize: Math.round(size * 0.42) }}>{initial}</span>;
};
