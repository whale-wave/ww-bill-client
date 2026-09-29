import type { ReactNode } from 'react';
import type { SurfaceProps } from '@/shared/ui/surface';
import { cn } from '@/shared/lib';
import { Surface } from '@/shared/ui/surface';
import './ios-card.scss';

export interface IosCardProps extends Omit<SurfaceProps, 'material'> {
  contentWrap?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  variant?: 'plain' | 'raised' | 'outline';
}

/** Source-adapted from Konsta CardClasses iOS structure and variants. */
export function IosCard({ children, className, contentWrap = true, footer, header, variant = 'plain', ...props }: IosCardProps) {
  return (
    <Surface {...props} className={cn('ww-ios-card overflow-hidden', `ww-ios-card--${variant}`, className)} material={variant === 'raised' ? 'raised' : 'content'}>
      {header && <header className="ww-ios-card__header p-4 text-[17px] font-semibold">{header}</header>}
      {contentWrap ? <div className="ww-ios-card__content p-4 text-sm">{children}</div> : children}
      {footer && <footer className="ww-ios-card__footer p-4 text-sm text-ww-mid">{footer}</footer>}
    </Surface>
  );
}
