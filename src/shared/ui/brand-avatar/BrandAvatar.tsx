import type { ImgHTMLAttributes } from 'react';
import whaleLogo from '@/assets/brand/whale-logo-surface-浅色渐变背景.png';
import { cn } from '@/shared/lib';

export interface BrandAvatarProps {
  className?: string;
  imageClassName?: string;
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'className' | 'src'>;
}

export function BrandAvatar({ className, imageClassName, imageProps }: BrandAvatarProps) {
  return (
    <span aria-hidden="true" className={cn('flex aspect-square shrink-0 overflow-hidden rounded-full', className)} data-brand-avatar>
      <img {...imageProps} alt="" className={cn('h-full w-full object-cover', imageClassName)} src={whaleLogo} />
    </span>
  );
}
