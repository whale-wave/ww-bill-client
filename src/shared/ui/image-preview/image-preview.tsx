import type { FC, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { Popup as KonstaPopup } from 'konsta/react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DialogFocusBoundary } from '@/shared/ui/app-overlay/DialogFocusBoundary';

const getImagePreviewContainer = () => document.body;

export interface ImagePreviewProps {
  image?: string;
  placeholder?: ReactNode;
  statusLabel?: string;
  visible?: boolean;
  onClose?: () => void;
}

export const ImagePreview: FC<ImagePreviewProps> = ({ image, onClose, placeholder, statusLabel, visible = false }) => {
  const descriptionId = useId();
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{
    centerX: number;
    centerY: number;
    distance: number;
    pointerX: number;
    pointerY: number;
    scale: number;
    x: number;
    y: number;
  }>();
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  useEffect(() => {
    if (!visible) {
      // Every preview session starts at the canonical 1x scale.
      // eslint-disable-next-line react/set-state-in-effect
      setTransform({ scale: 1, x: 0, y: 0 });
      pointersRef.current.clear();
      gestureRef.current = undefined;
    }
  }, [visible]);

  const applyTransform = (next: typeof transform) => {
    transformRef.current = next;
    setTransform(next);
  };

  const startGesture = () => {
    const points = [...pointersRef.current.values()];
    const current = transformRef.current;
    if (points.length >= 2) {
      const [first, second] = points;
      gestureRef.current = {
        centerX: (first.x + second.x) / 2,
        centerY: (first.y + second.y) / 2,
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        pointerX: 0,
        pointerY: 0,
        ...current,
      };
    }
    else if (points[0]) {
      gestureRef.current = {
        centerX: 0,
        centerY: 0,
        distance: 0,
        pointerX: points[0].x,
        pointerY: points[0].y,
        ...current,
      };
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId) || !gestureRef.current)
      return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointersRef.current.values()];
    const start = gestureRef.current;
    if (points.length >= 2 && start.distance > 0) {
      const [first, second] = points;
      const centerX = (first.x + second.x) / 2;
      const centerY = (first.y + second.y) / 2;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const scale = Math.min(4, Math.max(1, start.scale * distance / start.distance));
      applyTransform({ scale, x: start.x + centerX - start.centerX, y: start.y + centerY - start.centerY });
    }
    else if (points[0] && start.scale > 1) {
      applyTransform({
        scale: start.scale,
        x: start.x + points[0].x - start.pointerX,
        y: start.y + points[0].y - start.pointerY,
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    startGesture();
  };

  if (typeof document === 'undefined' || !visible)
    return null;

  return createPortal(
    <DialogFocusBoundary describedBy={descriptionId} label="图片预览" onEscape={onClose}>
      <KonstaPopup
        className="ww-image-preview-popup !z-[var(--ww-layer-overlay)] !flex !h-[100dvh] !w-screen !items-center !justify-center !bg-black/95"
        onBackdropClick={onClose}
        opened
      >
        <div
          className="adm-image-viewer-control absolute inset-0 overflow-hidden overscroll-contain p-5 [touch-action:none]"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        >
          {image
            ? (
                <div className="flex min-h-full min-w-full items-center justify-center">
                  <img
                    alt="预览图片"
                    className="max-h-[calc(100dvh-96px)] max-w-full select-none object-contain"
                    draggable={false}
                    onDoubleClick={() => applyTransform(transform.scale === 1 ? { scale: 2, x: 0, y: 0 } : { scale: 1, x: 0, y: 0 })}
                    src={image}
                    style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }}
                  />
                </div>
              )
            : <div className="flex min-h-full items-center justify-center">{placeholder}</div>}
        </div>
        <p aria-hidden className="pointer-events-none fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-0 right-0 text-center text-xs text-white/70">
          双指缩放 · 双击放大 · 拖动查看
        </p>
        <div className="ww-image-preview-dialog-layer pointer-events-none fixed inset-0">
          <p aria-live="polite" className="sr-only" id={descriptionId}>
            {image ? '支持双指缩放和拖动查看' : statusLabel ?? '图片加载中'}
          </p>
          <button
            aria-label="关闭图片预览"
            className="pointer-events-auto fixed right-4 top-[max(var(--ww-space-lg),env(safe-area-inset-top))] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-0 bg-white/15 p-0 text-white backdrop-blur"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={24} strokeWidth={2} />
          </button>
        </div>
      </KonstaPopup>
    </DialogFocusBoundary>,
    getImagePreviewContainer(),
  );
};
