import type { RecordEditorController } from '../model/useRecordEditorController';
import type { RecordEditorImage } from '../model/useRecordEditorImages';
import { ImageOff, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAttachmentObjectUrl, useRecordAttachmentContentQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { AppSheet, ImagePreview, SheetHeader } from '@/shared/ui';
import { showAppNotice } from '@/shared/ui/app-feedback';
import { MAX_RECORD_IMAGES } from '../model/useRecordEditorImages';

interface RecordEditorImageTileProps {
  image: RecordEditorImage;
  index: number;
  onPreview: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

function RecordEditorImageTile({ image, index, onPreview, onRemove, onRetry }: RecordEditorImageTileProps) {
  const { t } = useTranslation('record');
  const thumbnail = useRecordAttachmentContentQuery({
    attachmentId: image.kind === 'existing' ? image.attachment.id : undefined,
    enabled: image.kind === 'existing',
    variant: 'thumbnail',
  });
  const url = useAttachmentObjectUrl(image.kind === 'new' ? image.file : thumbnail.data);
  const isUploading = image.kind === 'new' && image.status === 'uploading';
  const hasError = image.kind === 'new' && image.status === 'error';

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border-primary bg-ww-surface-raised" data-record-editor-image-tile={image.id}>
      <button
        aria-label={t('bookkeeping.previewImageAt', { index: index + 1 })}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-0 bg-ww-surface-tint p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
        data-record-editor-image-preview={image.id}
        onClick={onPreview}
        type="button"
      >
        {url
          ? <img alt="" className="h-full w-full object-cover" src={url} />
          : <ImageOff aria-hidden="true" className="text-ww-mid" size={24} strokeWidth={1.8} />}
        {isUploading && <span className="absolute inset-x-0 bottom-0 bg-ww-ink/70 px-1 py-1 text-center text-[11px] font-semibold text-white">{t('bookkeeping.imageUploading')}</span>}
      </button>
      <div className="flex h-11 items-center justify-between pl-2">
        {hasError
          ? (
              <button className="flex min-h-11 min-w-0 items-center gap-1 text-[11px] font-semibold text-feedback-danger" onClick={onRetry} type="button">
                <RotateCcw aria-hidden="true" size={14} />
                {t('bookkeeping.retryImage')}
              </button>
            )
          : <span className="text-[11px] font-semibold text-ww-mid">{index + 1}</span>}
        <button
          aria-label={t('bookkeeping.removeImageAt', { index: index + 1 })}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-ww-mid active:text-feedback-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

interface RecordEditorImagesPanelProps {
  chipClassName: string;
  controller: RecordEditorController;
}

function RecordEditorImagePreview({ image, onClose }: { image: RecordEditorImage; onClose: () => void }) {
  const { t } = useTranslation('record');
  const contentQuery = useRecordAttachmentContentQuery({
    attachmentId: image.kind === 'existing' ? image.attachment.id : undefined,
    enabled: image.kind === 'existing',
    variant: 'content',
  });
  const previewUrl = useAttachmentObjectUrl(image.kind === 'new' ? image.file : contentQuery.data);

  return (
    <ImagePreview
      image={previewUrl}
      onClose={onClose}
      placeholder={contentQuery.isError
        ? <span className="text-sm font-semibold text-white">{t('bookkeeping.imagePreviewFailed')}</span>
        : <span className="text-sm font-semibold text-white">{t('bookkeeping.imagePreviewLoading')}</span>}
      statusLabel={contentQuery.isError ? t('bookkeeping.imagePreviewFailed') : t('bookkeeping.imagePreviewLoading')}
      visible
    />
  );
}

export function RecordEditorImagesPanel({ chipClassName, controller }: RecordEditorImagesPanelProps) {
  const { t } = useTranslation(['record', 'common']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string>();
  const selectedImage = controller.images.find(image => image.id === previewId);

  return (
    <>
      <button
        aria-label={`${t('record:bookkeeping.imageCount', { count: controller.images.length })}${controller.hasImageUploadError ? `，${t('record:bookkeeping.imageUploadFailed')}` : ''}`}
        className={cn(chipClassName, controller.images.length > 0 && 'border-primary-light bg-primary-light text-primary-deep', controller.hasImageUploadError && 'border-feedback-danger text-feedback-danger')}
        data-record-editor-image-trigger
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <ImagePlus aria-hidden="true" size={17} strokeWidth={1.8} />
        <span>{t('record:bookkeeping.image')}</span>
        {controller.images.length > 0 && (
          <span aria-hidden="true" className={cn('flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none text-white', controller.hasImageUploadError ? 'bg-feedback-danger' : 'bg-primary-deep')} data-record-editor-image-count>
            {controller.images.length}
          </span>
        )}
      </button>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          const accepted = controller.handleSelectImages(files);
          if (accepted < files.length)
            showAppNotice({ content: t('record:bookkeeping.imageLimit', { count: MAX_RECORD_IMAGES }) });
        }}
        ref={inputRef}
        type="file"
      />
      <AppSheet
        bodyClassName="max-h-[72vh] overflow-hidden !bg-white"
        destroyOnClose
        onClose={() => setIsOpen(false)}
        onMaskClick={() => setIsOpen(false)}
        position="bottom"
        visible={isOpen}
      >
        <SheetHeader
          closeLabel={t('common:nav.close')}
          description={t('record:bookkeeping.imageCountOfLimit', { count: controller.images.length, limit: MAX_RECORD_IMAGES })}
          onClose={() => setIsOpen(false)}
          title={t('record:bookkeeping.image')}
        />
        <div className="max-h-[calc(72vh-64px)] overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <div className="grid grid-cols-3 gap-2" data-record-editor-image-gallery>
            {controller.images.map((image, index) => (
              <RecordEditorImageTile
                image={image}
                index={index}
                key={image.id}
                onPreview={() => setPreviewId(image.id)}
                onRemove={() => controller.handleRemoveImage(image.id)}
                onRetry={() => controller.handleRetryImage(image.id)}
              />
            ))}
            {controller.canAddImages && (
              <button
                aria-label={t('record:bookkeeping.addImage')}
                className="flex min-h-[104px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-primary bg-primary-light/40 text-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
                data-record-editor-image-add
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <ImagePlus aria-hidden="true" size={24} strokeWidth={1.8} />
                <span className="text-xs font-semibold">{t('record:bookkeeping.addImage')}</span>
              </button>
            )}
          </div>
        </div>
      </AppSheet>
      {selectedImage && <RecordEditorImagePreview image={selectedImage} onClose={() => setPreviewId(undefined)} />}
    </>
  );
}
