import type { HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib';
import { useMotionPreference } from '@/shared/ui/motion';
import { DialogFocusBoundary } from './DialogFocusBoundary';

export interface AppModalAction {
  danger?: boolean;
  key?: number | string;
  onClick?: () => void;
  text: ReactNode;
}

export interface AppModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'onClose'> {
  actions?: AppModalAction[];
  afterClose?: () => void;
  bodyClassName?: string;
  closeOnMaskClick?: boolean;
  content?: ReactNode;
  maskClassName?: string;
  onClose?: () => void;
  visible?: boolean;
}

export function AppModal({
  actions,
  afterClose,
  bodyClassName,
  className,
  closeOnMaskClick = true,
  content,
  maskClassName: _maskClassName,
  onClose,
  visible = false,
  ...props
}: AppModalProps) {
  const { isMotionEnabled } = useMotionPreference();
  const previousVisibleRef = useRef(visible);
  useEffect(() => {
    if (!visible && previousVisibleRef.current)
      afterClose?.();
    previousVisibleRef.current = visible;
  }, [afterClose, visible]);

  if (typeof document === 'undefined' || !visible)
    return null;

  return createPortal(
    <DialogFocusBoundary
      label={typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined}
      labelledBy={typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined}
      onEscape={onClose}
    >
      <div
        {...props}
        className="fixed inset-0 z-[var(--ww-layer-dialog)] flex items-center justify-center p-4"
        role="presentation"
      >
        <button aria-label="关闭弹窗" className={cn('ww-app-overlay-mask fixed inset-0 border-0', _maskClassName)} onClick={closeOnMaskClick ? onClose : undefined} type="button" />
        <div className={cn('adm-modal adm-center-popup ww-app-modal-shell adm-modal-body ww-app-modal ww-ios-overlay-dialog-panel relative max-h-[85dvh] w-[min(390px,calc(100vw-32px))] overflow-y-auto', bodyClassName, className)} data-motion-enabled={isMotionEnabled}>
          <div className="adm-modal-content">{content}</div>
          {!!actions?.length && <div className="flex gap-2 p-3">{actions.map((action, index) => <button className={cn('min-h-11 flex-1 rounded-xl bg-ww-surface-tint px-3 font-semibold text-primary-deep', action.danger && 'text-feedback-danger')} key={action.key ?? index} onClick={action.onClick} type="button">{action.text}</button>)}</div>}
        </div>
      </div>
    </DialogFocusBoundary>,
    document.body,
  );
}
