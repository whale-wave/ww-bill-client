import type { CSSProperties, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { DialogFocusBoundary } from '@/shared/ui/app-overlay/DialogFocusBoundary';

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
    <DialogFocusBoundary label="操作选项" onEscape={close}>
      <div className="fixed inset-0 z-[var(--ww-layer-dialog)]">
        <button aria-label="关闭操作选项" className="ww-app-overlay-mask absolute inset-0 border-0" onClick={close} type="button" />
        <div className={`adm-action-sheet ww-ios-overlay-action-panel absolute inset-x-0 bottom-0 mx-auto max-w-[560px] p-3 pb-[max(12px,env(safe-area-inset-bottom))] ${options.popupClassName ?? ''}`.trim()}>
          {options.extra}
          <div className="adm-action-sheet-button-list overflow-hidden rounded-2xl bg-ww-surface-raised">
            {options.actions.map(action => (
              <button
                className={`adm-action-sheet-button-item flex min-h-12 w-full items-center justify-center border-0 border-b border-border-primary bg-transparent px-4 text-[15px] ${action.bold ? 'font-bold' : ''} ${action.danger ? 'adm-action-sheet-button-item-danger text-feedback-danger' : 'text-primary-deep'}`}
                disabled={action.disabled}
                key={action.key}
                onClick={() => {
                  const result = action.onClick?.();
                  if (result instanceof Promise)
                    void result.finally(close);
                  else
                    close();
                }}
                type="button"
              >
                <span className="adm-action-sheet-button-item-name">{action.text}</span>
              </button>
            ))}
          </div>
          <button className="adm-action-sheet-button-item adm-action-sheet-cancel mt-2 min-h-12 w-full rounded-2xl border-0 bg-ww-surface-raised font-bold text-primary-deep" onClick={close} type="button">{options.cancelText ?? '取消'}</button>
        </div>
      </div>
    </DialogFocusBoundary>,
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
      <DialogFocusBoundary label={typeof options.header === 'string' ? options.header : undefined} onEscape={() => finish(false)}>
        <div className="fixed inset-0 z-[var(--ww-layer-dialog)] flex items-center justify-center p-4" role="presentation">
          <button aria-label="关闭对话框" className={`ww-app-overlay-mask absolute inset-0 border-0 ${options.maskClassName ?? ''}`} onClick={options.closeOnMaskClick ? () => finish(false) : undefined} type="button" />
          <div className={`ww-app-dialog ww-ios-overlay-dialog-panel adm-dialog-body relative max-h-[85dvh] w-[min(390px,calc(100vw-32px))] ${options.bodyClassName ?? ''}`}>
            {options.header && <div className="adm-dialog-header px-5 pt-5"><div className="adm-dialog-title text-lg font-bold">{options.header}</div></div>}
            {options.content && <div className="adm-dialog-content px-5 py-4">{options.content}</div>}
            <div className="adm-dialog-footer flex gap-2 p-3">
              {!confirmOnly && <button className="adm-dialog-button min-h-11 flex-1 rounded-xl bg-ww-surface-tint" onClick={() => finish(false)} type="button">{options.cancelText ?? '取消'}</button>}
              <button className="adm-dialog-button min-h-11 flex-1 rounded-xl bg-primary text-white" onClick={() => finish(true)} type="button">{options.confirmText ?? '确定'}</button>
            </div>
          </div>
        </div>
      </DialogFocusBoundary>,
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
    <div aria-live="polite" className="ww-k-toast pointer-events-none fixed inset-x-4 top-[max(16px,env(safe-area-inset-top))] z-[var(--ww-layer-dialog)] flex justify-center">
      <span className="flex items-center gap-2 rounded-xl bg-ww-surface-raised px-4 py-3 text-[13px] font-semibold text-ww-ink shadow-ww">
        {options.icon === 'fail' && <CircleAlert aria-hidden className="text-feedback-danger" size={18} />}
        {options.icon && options.icon !== 'fail' ? options.icon : null}
        {options.content}
      </span>
    </div>,
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
