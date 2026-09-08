import type { ActionSheetProps } from 'antd-mobile';
import type { ReactNode } from 'react';
import { ActionSheet, Dialog } from 'antd-mobile';
import { CircleHelp, Trash2 } from 'lucide-react';
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

interface AppActionSheetOptions {
  actions: ActionSheetProps['actions'];
  cancelText?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

interface AppInfoOptions {
  confirmText?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
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
    header: title
      ? (
          <div className="ww-app-dialog__heading">
            <span className="ww-app-dialog__icon">{icon}</span>
            <strong>{title}</strong>
          </div>
        )
      : null,
    maskClassName: 'ww-app-overlay-mask',
  });
}

/** Compatibility entry point. Danger confirmations share the same dialog implementation and tokens. */
export function confirmDangerousAction(options: DangerConfirmOptions) {
  return confirmAppAction({
    ...options,
    icon: <Trash2 size={22} strokeWidth={1.8} />,
    tone: 'danger',
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
    extra: title || description
      ? (
          <div className="ww-app-action-sheet__heading">
            {title && <strong>{title}</strong>}
            {description && <p>{description}</p>}
          </div>
        )
      : undefined,
    popupClassName: 'ww-app-action-sheet',
    styles: {
      mask: {
        backdropFilter: 'var(--ww-material-overlay-blur)',
        background: 'var(--ww-material-scrim-background)',
      },
    },
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
    header: title
      ? (
          <div className="ww-app-dialog__heading">
            <span className="ww-app-dialog__icon">{icon}</span>
            <strong>{title}</strong>
          </div>
        )
      : null,
    maskClassName: 'ww-app-overlay-mask',
  });
}
