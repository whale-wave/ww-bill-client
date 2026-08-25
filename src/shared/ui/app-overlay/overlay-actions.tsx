import type { ActionSheetProps } from 'antd-mobile';
import type { ReactNode } from 'react';
import { ActionSheet, Dialog } from 'antd-mobile';
import { CircleHelp } from 'lucide-react';
import './app-overlay.scss';

interface AppConfirmOptions {
  cancelText: ReactNode;
  confirmText: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  tone?: 'danger' | 'primary' | 'warning';
}

interface AppActionSheetOptions {
  actions: ActionSheetProps['actions'];
  cancelText: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

interface AppInfoOptions {
  confirmText: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function confirmAppAction({
  cancelText,
  confirmText,
  description,
  icon = <CircleHelp size={22} strokeWidth={1.8} />,
  title,
  tone = 'primary',
}: AppConfirmOptions) {
  return Dialog.confirm({
    bodyClassName: `ww-app-dialog ww-app-dialog--${tone}`,
    cancelText,
    confirmText,
    content: <p className="ww-app-dialog__description">{description}</p>,
    header: (
      <div className="ww-app-dialog__heading">
        <span className="ww-app-dialog__icon">{icon}</span>
        <strong>{title}</strong>
      </div>
    ),
    maskClassName: 'ww-app-overlay-mask',
  });
}

export function showAppActionSheet({
  actions,
  cancelText,
  description,
  title,
}: AppActionSheetOptions) {
  return ActionSheet.show({
    actions,
    cancelText,
    closeOnAction: true,
    extra: (
      <div className="ww-app-action-sheet__heading">
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
    ),
    popupClassName: 'ww-app-action-sheet',
    styles: { mask: { backdropFilter: 'blur(5px)' } },
  });
}

export function showAppInfoDialog({
  confirmText,
  description,
  icon = <CircleHelp size={22} strokeWidth={1.8} />,
  title,
}: AppInfoOptions) {
  return Dialog.alert({
    bodyClassName: 'ww-app-dialog ww-app-dialog--primary',
    confirmText,
    content: description
      ? <p className="ww-app-dialog__description">{description}</p>
      : null,
    header: (
      <div className="ww-app-dialog__heading">
        <span className="ww-app-dialog__icon">{icon}</span>
        <strong>{title}</strong>
      </div>
    ),
    maskClassName: 'ww-app-overlay-mask',
  });
}
