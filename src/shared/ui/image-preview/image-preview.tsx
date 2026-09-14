import type { FC, ReactNode } from 'react';
import { Popup as KonstaPopup } from 'konsta/react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
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
  const [zoom, setZoom] = useState(1);
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

  useEffect(() => {
    if (!visible) {
      // Every preview session starts at the canonical 1x scale.
      // eslint-disable-next-line react/set-state-in-effect
      setZoom(1);
    }
  }, [visible]);

  if (typeof document === 'undefined' || !visible)
    return null;

  return createPortal(
    <KonstaPopup
      className="ww-image-preview-popup !z-[var(--ww-layer-overlay)] !flex !h-[100dvh] !w-screen !items-center !justify-center !bg-black/95"
      onBackdropClick={onClose}
      opened
    >
      <div className="adm-image-viewer-control absolute inset-0 overflow-auto overscroll-contain p-5 [touch-action:pinch-zoom]">
        {image
          ? (
              <div className="flex min-h-full min-w-full items-center justify-center">
                <img
                  alt="预览图片"
                  className="max-h-[calc(100dvh-96px)] max-w-full select-none object-contain transition-transform duration-200"
                  onDoubleClick={() => setZoom(current => current === 1 ? 2 : 1)}
                  src={image}
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
            )
          : <div className="flex min-h-full items-center justify-center">{placeholder}</div>}
      </div>
      <p aria-hidden className="pointer-events-none fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-0 right-0 text-center text-xs text-white/70">
        双指缩放 · 双击放大
      </p>
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
          className="pointer-events-auto fixed right-4 top-[max(var(--ww-space-lg),env(safe-area-inset-top))] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-0 bg-white/15 p-0 text-white backdrop-blur"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X aria-hidden size={24} strokeWidth={2} />
        </button>
      </div>
    </KonstaPopup>,
    getImagePreviewContainer(),
  );
};
