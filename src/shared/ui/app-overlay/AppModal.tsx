import type { HTMLAttributes, ReactNode } from 'react';
import { Dialog as KonstaDialog, DialogButton as KonstaDialogButton } from 'konsta/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib';
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
  const previousVisibleRef = useRef(visible);
  useEffect(() => {
    if (!visible && previousVisibleRef.current)
      afterClose?.();
    previousVisibleRef.current = visible;
  }, [afterClose, visible]);

  if (typeof document === 'undefined' || !visible)
    return null;

  const buttons = actions?.length
    ? actions.map((action, index) => (
        <KonstaDialogButton
          className={action.danger ? 'text-feedback-danger' : undefined}
          key={action.key ?? index}
          onClick={action.onClick}
        >
          {action.text}
        </KonstaDialogButton>
      ))
    : undefined;

  return createPortal(
    <DialogFocusBoundary
      label={typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined}
      labelledBy={typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined}
      onEscape={onClose}
    >
      <KonstaDialog
        {...props}
        buttons={buttons}
        className={cn('adm-modal adm-center-popup ww-app-modal-shell adm-modal-body ww-app-modal', bodyClassName, className)}
        content={<div className="adm-modal-content">{content}</div>}
        onBackdropClick={closeOnMaskClick ? onClose : undefined}
        opened={visible}
        sizeIos="w-[min(390px,calc(100vw-32px))]"
        translucent
      />
    </DialogFocusBoundary>,
    document.body,
  );
}
