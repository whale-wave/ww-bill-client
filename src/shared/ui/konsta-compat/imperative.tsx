import type { ButtonHTMLAttributes, ComponentType, CSSProperties, ReactNode } from 'react';
import {
  Actions as KonstaActions,
  ActionsButton as KonstaActionsButton,
  ActionsGroup as KonstaActionsGroup,
  App as KonstaApp,
  Dialog as KonstaDialog,
  DialogButton as KonstaDialogButton,
  Toast as KonstaToast,
} from 'konsta/react';
import { CircleAlert } from 'lucide-react';
import { createRoot } from 'react-dom/client';

interface ImperativeAction {
  bold?: boolean;
  danger?: boolean;
  disabled?: boolean;
  key: number | string;
  onClick?: () => unknown;
  text: ReactNode;
}

interface ActionSheetOptions {
  actions: ImperativeAction[];
  cancelText?: ReactNode;
  extra?: ReactNode;
  popupClassName?: string;
}

interface DialogOptions {
  bodyClassName?: string;
  cancelText?: ReactNode;
  closeOnMaskClick?: boolean;
  confirmText?: ReactNode;
  content?: ReactNode;
  header?: ReactNode;
  maskClassName?: string;
}

interface ToastOptions {
  content: ReactNode;
  duration?: number;
  icon?: 'fail' | ReactNode | null;
  maskClickable?: boolean;
  maskStyle?: CSSProperties;
}

const ActionsButtonBridge = KonstaActionsButton as unknown as ComponentType<ButtonHTMLAttributes<HTMLButtonElement> & { bold?: boolean }>;

function createOverlayRoot() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  return {
    render: root.render.bind(root),
    remove: () => queueMicrotask(() => {
      root.unmount();
      container.remove();
    }),
  };
}

function showActionSheet(options: ActionSheetOptions) {
  if (typeof document === 'undefined')
    return { close: () => undefined };
  const overlay = createOverlayRoot();
  let closed = false;
  const close = () => {
    if (closed)
      return;
    closed = true;
    overlay.remove();
  };
  overlay.render(
    <KonstaApp className="contents" dark={false} safeAreas={false} theme="ios">
      <KonstaActions className={`adm-action-sheet ${options.popupClassName ?? ''}`.trim()} onBackdropClick={close} opened>
        {options.extra}
        <KonstaActionsGroup className="adm-action-sheet-button-list">
          {options.actions.map(action => (
            <ActionsButtonBridge
              bold={action.bold}
              className={action.danger ? 'adm-action-sheet-button-item adm-action-sheet-button-item-danger' : 'adm-action-sheet-button-item'}
              disabled={action.disabled}
              key={action.key}
              onClick={() => {
                const result = action.onClick?.();
                if (result instanceof Promise)
                  void result.finally(close);
                else
                  close();
              }}
            >
              <span className="adm-action-sheet-button-item-name">{action.text}</span>
            </ActionsButtonBridge>
          ))}
        </KonstaActionsGroup>
        <KonstaActionsGroup className="adm-action-sheet-cancel">
          <KonstaActionsButton className="adm-action-sheet-button-item" onClick={close} bold>
            {options.cancelText ?? '取消'}
          </KonstaActionsButton>
        </KonstaActionsGroup>
      </KonstaActions>
    </KonstaApp>,
  );
  return { close };
}

function showDialog(options: DialogOptions, confirmOnly: boolean) {
  if (typeof document === 'undefined')
    return Promise.resolve(confirmOnly ? undefined : false);
  const overlay = createOverlayRoot();
  return new Promise<boolean | void>((resolve) => {
    const finish = (confirmed: boolean) => {
      resolve(confirmOnly ? undefined : confirmed);
      overlay.remove();
    };
    overlay.render(
      <KonstaApp className="contents" dark={false} safeAreas={false} theme="ios">
        <KonstaDialog
          buttons={(
            <>
              {!confirmOnly && <KonstaDialogButton className="adm-dialog-button" onClick={() => finish(false)}>{options.cancelText ?? '取消'}</KonstaDialogButton>}
              <KonstaDialogButton className="adm-dialog-button" onClick={() => finish(true)} strong>{options.confirmText ?? '确定'}</KonstaDialogButton>
            </>
          )}
          className={options.bodyClassName}
          content={options.content}
          onBackdropClick={options.closeOnMaskClick ? () => finish(false) : undefined}
          opened
          title={options.header}
          translucent
        />
      </KonstaApp>,
    );
  });
}

let clearToast: (() => void) | undefined;

function showToast(options: ToastOptions) {
  if (typeof document === 'undefined')
    return;
  clearToast?.();
  const overlay = createOverlayRoot();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const clear = () => {
    if (timeout)
      clearTimeout(timeout);
    overlay.remove();
    if (clearToast === clear)
      clearToast = undefined;
  };
  clearToast = clear;
  overlay.render(
    <KonstaApp className="contents" dark={false} safeAreas={false} theme="ios">
      <KonstaToast className="ww-k-toast !top-[max(16px,env(safe-area-inset-top))] !bottom-auto !z-[var(--ww-layer-overlay)]" opened position="center">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ww-ink">
          {options.icon === 'fail' && <CircleAlert aria-hidden className="text-feedback-danger" size={18} />}
          {options.icon && options.icon !== 'fail' ? options.icon : null}
          {options.content}
        </span>
      </KonstaToast>
    </KonstaApp>,
  );
  timeout = setTimeout(clear, options.duration ?? 1500);
  return { close: clear };
}

export const ActionSheet = { show: showActionSheet };
export const Dialog = {
  alert: (options: DialogOptions) => showDialog(options, true) as Promise<void>,
  confirm: (options: DialogOptions) => showDialog(options, false) as Promise<boolean>,
};
export const Toast = { clear: () => clearToast?.(), show: showToast };
