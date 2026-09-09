import type { FC, ReactNode } from 'react';
import { ImageViewer, Mask } from 'antd-mobile';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const getImagePreviewContainer = () => document.body;

export interface ImagePreviewProps {
  image?: string;
  placeholder?: ReactNode;
  statusLabel?: string;
  visible?: boolean;
  onClose?: () => void;
}

export const ImagePreview: FC<ImagePreviewProps> = ({ image, onClose, placeholder, statusLabel, visible = false }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const descriptionId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible)
      return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const appRoot = document.getElementById('root');
    const appRootWasInert = appRoot?.hasAttribute('inert') ?? false;
    appRoot?.setAttribute('inert', '');
    closeButtonRef.current?.focus();

    const keepFocusInDialog = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target))
        closeButtonRef.current?.focus();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
      }
      else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener('focusin', keepFocusInDialog);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', keepFocusInDialog);
      document.removeEventListener('keydown', handleKeyDown);
      if (!appRootWasInert)
        appRoot?.removeAttribute('inert');
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected)
        previousFocus.focus();
    };
  }, [visible]);

  return (
    <>
      <ImageViewer
        classNames={{ body: 'h-[100dvh]' }}
        getContainer={getImagePreviewContainer}
        image={image}
        maxZoom={4}
        onClose={onClose}
        renderFooter={() => (
          <p aria-hidden className="pointer-events-none mb-5 text-center text-xs text-white/70">双指缩放 · 拖动查看</p>
        )}
        visible={Boolean(image && visible)}
      />
      <Mask
        destroyOnClose
        getContainer={getImagePreviewContainer}
        opacity="thick"
        visible={Boolean(visible && !image)}
      >
        <div className="fixed inset-0 flex items-center justify-center p-5">
          {placeholder}
        </div>
      </Mask>
      {typeof document !== 'undefined' && visible && createPortal(
        <div
          aria-describedby={descriptionId}
          aria-label="图片预览"
          aria-modal="true"
          className="ww-image-preview-dialog-layer pointer-events-none fixed inset-0"
          ref={dialogRef}
          role="dialog"
        >
          <p aria-live="polite" className="sr-only" id={descriptionId}>
            {image ? '支持双指缩放和拖动查看' : statusLabel ?? '图片加载中'}
          </p>
          <button
            aria-label="关闭图片预览"
            className="pointer-events-auto fixed right-4 top-[max(var(--ww-space-lg),env(safe-area-inset-top))] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-0 bg-black/50 p-0 text-white"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden size={24} strokeWidth={2} />
          </button>
        </div>,
        document.body,
      )}
    </>
  );
};
