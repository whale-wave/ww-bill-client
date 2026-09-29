import type { Area, Point } from 'react-easy-crop';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from '@/shared/i18n';
import { showAppError } from '@/shared/ui/app-feedback';
import { createCroppedCategoryImage } from '../model/category-image-crop';

interface CategoryImageCropperProps {
  onConfirm: (file: File) => void;
  onInvalidImage: () => void;
  sourceUrl: string;
}

export function CategoryImageCropper({ onConfirm, onInvalidImage, sourceUrl }: CategoryImageCropperProps) {
  const { t } = useTranslation('ledger');
  const frameRef = useRef<HTMLDivElement>(null);
  const cropAreaRef = useRef<Area>();
  const isActiveRef = useRef(true);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const handleInvalidImage = (message: string) => {
    showAppError({ content: message, icon: 'fail' });
    onInvalidImage();
  };

  const handleConfirm = async () => {
    const image = frameRef.current?.querySelector('img');
    const cropArea = cropAreaRef.current;
    if (!image || !cropArea || !isReady || isExporting)
      return;
    setIsExporting(true);
    try {
      const croppedImage = await createCroppedCategoryImage(image, cropArea);
      if (isActiveRef.current)
        onConfirm(croppedImage);
    }
    catch {
      if (isActiveRef.current) {
        showAppError({ content: t('categories.cropFailed'), icon: 'fail' });
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-6" data-category-image-cropper>
      <p className="mb-5 text-center text-[12px] font-semibold leading-5 text-ww-mid">{t('categories.cropHint')}</p>
      <div
        aria-label={t('categories.cropArea')}
        className="relative mx-auto aspect-square w-full max-w-[280px] shrink-0 overflow-hidden rounded-[18px] border border-solid border-border-primary bg-ww-ink"
        ref={frameRef}
      >
        <Cropper
          aspect={1}
          crop={crop}
          cropShape="rect"
          image={sourceUrl}
          maxZoom={4}
          mediaProps={{ onError: () => handleInvalidImage(t('categories.imageFailed')) }}
          minZoom={1}
          objectFit="cover"
          onCropAreaChange={(_area, areaPixels) => {
            cropAreaRef.current = areaPixels;
            setIsReady(true);
          }}
          onCropChange={setCrop}
          onMediaLoaded={({ naturalWidth, naturalHeight }) => {
            if (!naturalWidth || !naturalHeight || naturalWidth * naturalHeight > 16_000_000)
              handleInvalidImage(t(naturalWidth && naturalHeight ? 'categories.errors.iconTooLarge' : 'categories.imageFailed'));
          }}
          onZoomChange={setZoom}
          showGrid={false}
          zoom={zoom}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-[320px] items-center gap-3">
        <button aria-label={t('categories.zoomOut')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-ww-surface-tint text-primary-deep disabled:opacity-35" disabled={!isReady || zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.25))} type="button"><Minus size={18} /></button>
        <input aria-label={t('categories.zoom')} className="h-11 min-w-0 flex-1 accent-primary" disabled={!isReady} max="4" min="1" onChange={event => setZoom(Number(event.target.value))} step="0.01" type="range" value={zoom} />
        <button aria-label={t('categories.zoomIn')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-ww-surface-tint text-primary-deep disabled:opacity-35" disabled={!isReady || zoom >= 4} onClick={() => setZoom(Math.min(4, zoom + 0.25))} type="button"><Plus size={18} /></button>
      </div>
      <button className="mx-auto mt-auto min-h-[52px] w-full max-w-[320px] shrink-0 rounded-[16px] border-0 bg-primary px-4 text-[14px] font-extrabold text-white disabled:opacity-35" disabled={!isReady || isExporting} onClick={() => void handleConfirm()} type="button">{isExporting ? t('categories.cropping') : t('categories.applyCrop')}</button>
    </div>
  );
}
