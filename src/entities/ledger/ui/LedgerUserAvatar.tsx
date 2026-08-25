import type { CSSProperties, FC } from 'react';
import type { LedgerUserSummary } from '../types';
import { cn } from '@/shared/lib';

export interface LedgerUserAvatarProps {
  className?: string;
  fallback?: string;
  size?: number;
  style?: CSSProperties;
  testId?: string;
  user?: Partial<LedgerUserSummary> | null;
}

export const LedgerUserAvatar: FC<LedgerUserAvatarProps> = ({
  className,
  fallback = '?',
  size = 42,
  style,
  testId,
  user,
}) => {
  const avatarUrl = user?.avatar;
  const displayName = user?.nickname || user?.name || user?.username || fallback;
  const initial = displayName ? String(displayName).slice(0, 1) : '?';
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

  if (avatarUrl) {
    return (
      <img
        alt=""
        className={cn(
          'aspect-square shrink-0 flex-none self-center overflow-hidden rounded-full border-2 border-solid border-white object-cover shadow-ww-xs',
          className,
        )}
        data-avatar-type="image"
        data-testid={testId}
        height={size}
        src={avatarUrl}
        style={dimensionStyle}
        width={size}
      />
    );
  }

  return (
    <span
      className={cn(
        'flex aspect-square shrink-0 flex-none self-center items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#c8eaf6,#e8f6ff)] font-black text-primary-deep shadow-ww-xs',
        className,
      )}
      data-avatar-type="fallback"
      data-testid={testId}
      style={{
        ...dimensionStyle,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </span>
  );
};
