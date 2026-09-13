import type { CSSProperties, FC } from 'react';
import type { LedgerUserSummary } from '../types';
import { UserAvatar } from '@/shared/ui';

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
  const displayName = user?.nickname || user?.name || user?.username || fallback;
  return <UserAvatar alt={displayName} className={className} name={displayName} size={size} src={user?.avatar} style={style} testId={testId} />;
};
