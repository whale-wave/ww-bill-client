import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Sheet as KonstaSheet } from 'konsta/react';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib';
import './app-overlay.scss';

export interface AppSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  afterClose?: () => void;
  afterShow?: () => void;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  children?: ReactNode;
  closeOnMaskClick?: boolean;
  destroyOnClose?: boolean;
  maskClassName?: string;
  material?: 'default' | 'opaque';
  onClose?: () => void;
  onMaskClick?: () => void;
  position?: 'bottom' | 'top';
  showCloseButton?: boolean;
  visible?: boolean;
}

export function AppSheet({
  afterClose,
  afterShow,
  bodyClassName,
  bodyStyle,
  children,
  className,
  closeOnMaskClick = true,
  destroyOnClose,
  maskClassName,
  material = 'default',
  onClose,
  onMaskClick,
  position = 'bottom',
  showCloseButton,
  visible = false,
  ...props
}: AppSheetProps) {
  const previousVisibleRef = useRef(visible);
  useEffect(() => {
    if (visible && !previousVisibleRef.current)
      afterShow?.();
    if (!visible && previousVisibleRef.current)
      afterClose?.();
    previousVisibleRef.current = visible;
  }, [afterClose, afterShow, visible]);

  if (typeof document === 'undefined' || (destroyOnClose && !visible))
    return null;

  const close = () => {
    (onMaskClick ?? onClose)?.();
  };
  const resolvedBodyStyle = position === 'top'
    ? {
        ...bodyStyle,
        bottom: 'auto',
        top: 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }
    : bodyStyle;

  return createPortal(
    <div
      aria-hidden={!visible}
      className={cn('adm-popup ww-app-sheet-shell', visible && 'ww-app-sheet-shell--open')}
      hidden={!visible}
    >
      <button
        aria-label="关闭弹层"
        className={cn('ww-app-overlay-mask adm-mask fixed inset-0 z-[var(--ww-layer-scrim)] border-0', maskClassName)}
        onClick={closeOnMaskClick ? close : undefined}
        type="button"
      />
      <KonstaSheet
        {...props}
        backdrop={false}
        className={cn(
          'adm-popup-body ww-app-sheet',
          `ww-app-sheet--${position}`,
          material === 'opaque' && 'ww-app-sheet--opaque',
          visible && 'ww-app-sheet--open',
          bodyClassName,
          className,
        )}
        opened={visible}
        style={resolvedBodyStyle}
      >
        {showCloseButton && (
          <button
            aria-label="关闭"
            className="adm-popup-close-icon absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-black/5 text-ww-mid"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={19} />
          </button>
        )}
        {children}
      </KonstaSheet>
    </div>,
    document.body,
  );
}
