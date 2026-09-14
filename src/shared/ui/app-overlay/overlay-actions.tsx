import type { ReactNode } from 'react';
import { CircleHelp, Trash2 } from 'lucide-react';
import { ActionSheet, Dialog } from '@/shared/ui/konsta-compat';
import './app-overlay.scss';

interface AppConfirmOptions {
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  tone?: 'danger' | 'primary' | 'warning';
}

type DangerConfirmOptions = Omit<AppConfirmOptions, 'icon' | 'tone'>;

export interface AppActionSheetAction {
  bold?: boolean;
  danger?: boolean;
  disabled?: boolean;
  key: number | string;
  onClick?: () => unknown;
  text: ReactNode;
}

interface AppActionSheetOptions {
  actions: AppActionSheetAction[];
  cancelText?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

interface AppInfoOptions {
  closeOnMaskClick?: boolean;
  confirmText?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
}

function createHeading(title: ReactNode, icon: ReactNode) {
  return (
    <div className="ww-app-dialog__heading">
      <span className="ww-app-dialog__icon">{icon}</span>
      <strong>{title}</strong>
    </div>
  );
}

export function confirmAppAction({
  cancelText = '取消',
  confirmText = '确定',
  description,
  icon = <CircleHelp size={22} strokeWidth={1.8} />,
  title,
  tone = 'primary',
}: AppConfirmOptions) {
  return Dialog.confirm({
    bodyClassName: `ww-app-dialog ww-app-dialog--${tone}`,
    cancelText,
    confirmText,
    content: typeof description === 'string'
      ? <p className="ww-app-dialog__description">{description}</p>
      : description,
    header: title ? createHeading(title, icon) : undefined,
    maskClassName: 'ww-app-overlay-mask',
  });
}

export function confirmDangerousAction(options: DangerConfirmOptions) {
  return confirmAppAction({
    ...options,
    icon: <Trash2 size={22} strokeWidth={1.8} />,
    tone: 'danger',
  });
}

export function showAppActionSheet({
  actions,
  cancelText = '取消',
  description,
  title,
}: AppActionSheetOptions) {
  return ActionSheet.show({
    actions,
    cancelText,
    extra: (title || description)
      ? (
          <div className="adm-action-sheet-extra ww-app-action-sheet__heading">
            {title && <strong>{title}</strong>}
            {description && <p>{description}</p>}
          </div>
        )
      : undefined,
    popupClassName: 'ww-app-action-sheet',
  });
}

export function showAppInfoDialog({
  closeOnMaskClick = false,
  confirmText = '知道了',
  description,
  icon = <CircleHelp size={22} strokeWidth={1.8} />,
  title,
}: AppInfoOptions) {
  return Dialog.alert({
    bodyClassName: 'ww-app-dialog ww-app-dialog--primary',
    closeOnMaskClick,
    confirmText,
    content: typeof description === 'string'
      ? <p className="ww-app-dialog__description">{description}</p>
      : description,
    header: title ? createHeading(title, icon) : undefined,
    maskClassName: 'ww-app-overlay-mask',
  });
}
