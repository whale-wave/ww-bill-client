import type { Area, Point } from 'react-easy-crop';
import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from '@/shared/i18n';
import { AppButton, Surface } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import { createCroppedAvatarImage } from '../model/avatar-image-crop';

const MAX_SOURCE_PIXELS = 16_000_000;

interface AvatarImageCropDialogProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void>;
  sourceUrl: string;
}

export function AvatarImageCropDialog({ isSubmitting, onCancel, onConfirm, sourceUrl }: AvatarImageCropDialogProps) {
  const { t } = useTranslation('user');
  const frameRef = useRef<HTMLDivElement>(null);
  const cropAreaRef = useRef<Area>();
  const isActiveRef = useRef(true);
  const hasInvalidImageRef = useRef(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isBusy = isExporting || isSubmitting;

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const handleInvalidImage = (message: string) => {
    if (hasInvalidImageRef.current)
      return;
    hasInvalidImageRef.current = true;
    showAppError({ content: message, icon: 'fail' });
    onCancel();
  };

  const handleConfirm = async () => {
    const image = frameRef.current?.querySelector('img');
    const cropArea = cropAreaRef.current;
    if (!image || !cropArea || !isReady || isBusy)
      return;

    setIsExporting(true);
    try {
      const croppedImage = await createCroppedAvatarImage(image, cropArea);
      await onConfirm(croppedImage);
    }
    catch (error) {
      if (isActiveRef.current)
        showAppError(error, { fallbackMessage: t('info.avatarCropFailed') });
    }
    finally {
      if (isActiveRef.current)
        setIsExporting(false);
    }
  };

  return (
    <div
      aria-labelledby="avatar-crop-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[1002] flex items-end bg-black/25 px-3 pt-12 backdrop-blur-[3px] sm:items-center sm:justify-center"
      data-avatar-crop-dialog
      role="dialog"
    >
      <Surface className="flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-b-none px-0 pb-0 pt-0 sm:rounded-[24px]" material="floating">
        <header className="flex shrink-0 items-center justify-between border-0 border-b border-solid border-border-primary px-5 py-4">
          <div>
            <h2 className="text-[17px] font-extrabold text-ww-ink" id="avatar-crop-dialog-title">{t('info.avatarCropTitle')}</h2>
            <p className="mt-1 text-[11px] font-semibold text-ww-mid">{t('info.avatarCropHint')}</p>
          </div>
          <button
            aria-label={t('common:nav.cancel')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-bg-gray text-ww-mid disabled:opacity-35"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5">
          <div
            aria-label={t('info.avatarCropArea')}
            className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-[18px] border border-solid border-border-primary bg-ww-ink"
            ref={frameRef}
          >
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="rect"
              image={sourceUrl}
              maxZoom={4}
              mediaProps={{ onError: () => handleInvalidImage(t('info.avatarImageFailed')) }}
              minZoom={1}
              objectFit="cover"
              onCropAreaChange={(_area, areaPixels) => {
                cropAreaRef.current = areaPixels;
                setIsReady(true);
              }}
              onCropChange={setCrop}
              onMediaLoaded={({ naturalHeight, naturalWidth }) => {
                if (!naturalWidth || !naturalHeight || naturalWidth * naturalHeight > MAX_SOURCE_PIXELS) {
                  handleInvalidImage(t(naturalWidth && naturalHeight
                    ? 'info.avatarImageTooLarge'
                    : 'info.avatarImageFailed'));
                }
              }}
              onZoomChange={setZoom}
              showGrid
              zoom={zoom}
            />
          </div>

          <div className="mx-auto mt-5 flex w-full max-w-[320px] items-center gap-3">
            <button aria-label={t('info.avatarZoomOut')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-ww-surface-tint text-primary-deep disabled:opacity-35" disabled={!isReady || isBusy || zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.25))} type="button"><Minus size={18} /></button>
            <input aria-label={t('info.avatarZoom')} className="h-11 min-w-0 flex-1 accent-primary" disabled={!isReady || isBusy} max="4" min="1" onChange={event => setZoom(Number(event.target.value))} step="0.01" type="range" value={zoom} />
            <button aria-label={t('info.avatarZoomIn')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-ww-surface-tint text-primary-deep disabled:opacity-35" disabled={!isReady || isBusy || zoom >= 4} onClick={() => setZoom(Math.min(4, zoom + 0.25))} type="button"><Plus size={18} /></button>
          </div>

          <AppButton
            className="mx-auto mt-5 max-w-[320px]"
            disabled={!isReady}
            fullWidth
            loading={isBusy}
            loadingLabel={t('info.avatarUploading')}
            onClick={() => void handleConfirm()}
            size="large"
          >
            {t('info.avatarApplyCrop')}
          </AppButton>
        </div>
      </Surface>
    </div>
  );
}
