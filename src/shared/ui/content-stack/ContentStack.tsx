import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface ContentStackProps {
  children: ReactNode;
  className?: string;
  gap?: 12 | 16;
}

export const ContentStack: FC<ContentStackProps> = ({ children, className, gap = 12 }) => (
  <div className={cn('flex min-w-0 flex-col', gap === 16 ? 'gap-4' : 'gap-3', className)}>{children}</div>
);

export const SectionStack: FC<Omit<ContentStackProps, 'gap'>> = props => <ContentStack {...props} gap={16} />;
