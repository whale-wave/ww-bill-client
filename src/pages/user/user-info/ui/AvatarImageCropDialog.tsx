import type { Area, Point } from 'react-easy-crop';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppSheet, SheetHeader } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import { createCroppedAvatarImage } from '../model/avatar-image-crop';

interface AvatarImageCropDialogProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void>;
  sourceUrl: string;
}

export function AvatarImageCropDialog({ isSubmitting, onCancel, onConfirm, sourceUrl }: AvatarImageCropDialogProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const cropAreaRef = useRef<Area>();
  const isActiveRef = useRef(true);
  const hasInvalidImageRef = useRef(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useTranslation('user');
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

  const handleCancel = () => {
    if (!isBusy)
      onCancel();
  };

  return (
    <AppSheet
      bodyClassName="flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden"
      closeOnMaskClick={!isBusy}
      destroyOnClose
      onClose={handleCancel}
      onMaskClick={handleCancel}
      showCloseButton={false}
      visible
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden" data-avatar-crop-dialog>
        <SheetHeader
          closeLabel={t('common:nav.cancel')}
          description={t('info.avatarCropHint')}
          onClose={handleCancel}
          title={t('info.avatarCropTitle')}
        />
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
                if (!naturalWidth || !naturalHeight)
                  handleInvalidImage(t('info.avatarImageFailed'));
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
            aria-busy={isBusy || undefined}
            className="mx-auto mt-5 max-w-[320px]"
            disabled={!isReady || isBusy}
            fullWidth
            onClick={() => void handleConfirm()}
            size="large"
          >
            {isBusy ? t('info.avatarUploading') : t('info.avatarApplyCrop')}
          </AppButton>
        </div>
      </div>
    </AppSheet>
  );
}
