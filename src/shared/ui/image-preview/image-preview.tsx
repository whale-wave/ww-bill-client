import type { FC, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DialogFocusBoundary } from '@/shared/ui/app-overlay/DialogFocusBoundary';

const getImagePreviewContainer = () => document.body;

export interface ImagePreviewProps {
  defaultIndex?: number;
  image?: string;
  images?: string[];
  placeholder?: ReactNode;
  statusLabel?: string;
  visible?: boolean;
  onClose?: () => void;
}

export const ImagePreview: FC<ImagePreviewProps> = ({ defaultIndex = 0, image, images, onClose, placeholder, statusLabel, visible = false }) => {
  const descriptionId = useId();
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const isGallery = Boolean(images && images.length > 1);
  const activeImage = isGallery ? images?.[activeIndex] : image;
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

  useEffect(() => {
    if (visible) {
      // Start each gallery session at the requested attachment.
      // eslint-disable-next-line react/set-state-in-effect
      setActiveIndex(defaultIndex);
    }
  }, [defaultIndex, visible]);

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
    const start = gestureRef.current;
    const point = pointersRef.current.get(event.pointerId);
    if (isGallery && pointersRef.current.size === 1 && start && point && start.scale === 1) {
      const horizontalDistance = point.x - start.pointerX;
      if (Math.abs(horizontalDistance) > 60 && Math.abs(horizontalDistance) > Math.abs(point.y - start.pointerY))
        setActiveIndex(current => Math.max(0, Math.min((images?.length ?? 1) - 1, current + (horizontalDistance < 0 ? 1 : -1))));
    }
    pointersRef.current.delete(event.pointerId);
    startGesture();
  };

  if (typeof document === 'undefined' || !visible)
    return null;

  return createPortal(
    <DialogFocusBoundary describedBy={descriptionId} label="图片预览" onEscape={onClose}>
      <div
        className="ww-image-preview-popup fixed inset-0 !z-[var(--ww-ref-z-image-preview)] !flex !h-[100dvh] !w-screen !items-center !justify-center !bg-black/95"
      >
        <div
          className="adm-image-viewer-control absolute inset-0 overflow-hidden overscroll-contain p-5 [touch-action:none]"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        >
          {activeImage
            ? (
                <div className="flex min-h-full min-w-full items-center justify-center">
                  <img
                    alt="预览图片"
                    className="max-h-[calc(100dvh-96px)] max-w-full select-none object-contain"
                    draggable={false}
                    onDoubleClick={() => applyTransform(transform.scale === 1 ? { scale: 2, x: 0, y: 0 } : { scale: 1, x: 0, y: 0 })}
                    src={activeImage}
                    style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }}
                  />
                </div>
              )
            : <div className="flex min-h-full items-center justify-center">{placeholder}</div>}
        </div>
        <div className="pointer-events-none fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-0 right-0 flex items-center justify-center gap-4 text-xs text-white/70">
          {isGallery && <button aria-label="上一张图片" className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white disabled:opacity-40" disabled={activeIndex === 0} onClick={() => setActiveIndex(current => current - 1)} type="button"><ChevronLeft size={20} /></button>}
          <span className="rounded-full bg-black/75 px-3 py-2">{isGallery ? `${activeIndex + 1} / ${images?.length} · 左右滑动 · 双指缩放` : '双指缩放 · 双击放大 · 拖动查看'}</span>
          {isGallery && <button aria-label="下一张图片" className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white disabled:opacity-40" disabled={activeIndex >= (images?.length ?? 1) - 1} onClick={() => setActiveIndex(current => current + 1)} type="button"><ChevronRight size={20} /></button>}
        </div>
        <div className="ww-image-preview-dialog-layer pointer-events-none fixed inset-0">
          <p aria-live="polite" className="sr-only" id={descriptionId}>
            {activeImage ? (isGallery ? `共 ${images?.length} 张图片，支持左右滑动和双指缩放` : '支持双指缩放和拖动查看') : statusLabel ?? '图片加载中'}
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
      </div>
    </DialogFocusBoundary>,
    getImagePreviewContainer(),
  );
};
