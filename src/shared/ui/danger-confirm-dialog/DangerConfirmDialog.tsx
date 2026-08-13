import type { ReactNode } from 'react';
import { Dialog } from 'antd-mobile';
import { Trash2 } from 'lucide-react';
import './danger-confirm-dialog.scss';

interface DangerConfirmDialogOptions {
  cancelText: ReactNode;
  confirmText: ReactNode;
  description: ReactNode;
  title: ReactNode;
}

export function confirmDangerousAction({
  cancelText,
  confirmText,
  description,
  title,
}: DangerConfirmDialogOptions) {
  return Dialog.confirm({
    bodyClassName: 'ww-danger-confirm-dialog',
    cancelText,
    confirmText,
    content: <p className="ww-danger-confirm-dialog__description">{description}</p>,
    header: (
      <div className="ww-danger-confirm-dialog__heading">
        <span className="ww-danger-confirm-dialog__icon"><Trash2 size={22} strokeWidth={1.8} /></span>
        <strong>{title}</strong>
      </div>
    ),
    maskClassName: 'ww-danger-confirm-dialog__mask',
  });
}
