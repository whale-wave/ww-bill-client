import type { RecordEditorImage } from '../model/useRecordEditorImages';
import { ImageOff, ImagePlus, Info, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAttachmentObjectUrl, useRecordAttachmentContentQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { AppSheet, getImagePreviewStatusImage, ImageGallerySheetHeader, ImagePreview } from '@/shared/ui';
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
  const { t } = useTranslation(['record', 'common']);
  const thumbnail = useRecordAttachmentContentQuery({
    attachmentId: image.kind === 'existing' ? image.attachment.id : undefined,
    enabled: image.kind === 'existing',
    variant: 'thumbnail',
  });
  const url = useAttachmentObjectUrl(image.kind === 'new' ? image.file : thumbnail.data);
  const isUploading = image.kind === 'new' && image.status === 'uploading';
  const hasError = image.kind === 'new' && image.status === 'error';

  return (
    <div className="relative min-w-0" data-record-editor-image-tile={image.id}>
      <button
        aria-label={t('bookkeeping.previewImageAt', { index: index + 1 })}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border-primary bg-ww-surface-tint p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
        data-record-editor-image-preview={image.id}
        onClick={onPreview}
        type="button"
      >
        {url
          ? <img alt="" className="h-full w-full object-cover" src={url} />
          : <ImageOff aria-hidden="true" className="text-ww-mid" size={24} strokeWidth={1.8} />}
        {isUploading && <span className="absolute inset-x-0 bottom-0 bg-ww-ink px-1 py-1 text-center text-[11px] font-semibold text-white">{t('bookkeeping.imageUploading')}</span>}
      </button>
      <button
        aria-label={t('bookkeeping.removeImageAt', { index: index + 1 })}
        className="absolute -right-2 -top-2 z-10 flex h-11 w-11 items-start justify-end p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
        onClick={onRemove}
        type="button"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ww-mid text-white">
          <X aria-hidden="true" size={12} strokeWidth={2.2} />
        </span>
      </button>
      {hasError && (
        <button
          aria-label={t('record:bookkeeping.retryImage')}
          className="absolute inset-x-0 bottom-0 flex min-h-11 items-center justify-center gap-1 rounded-b-xl bg-feedback-danger text-[11px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} />
          {t('common:retry')}
        </button>
      )}
    </div>
  );
}

interface RecordEditorImagesPanelProps {
  canAddImages: boolean;
  chipClassName: string;
  hasImageUploadError: boolean;
  images: RecordEditorImage[];
  onRemoveImage: (id: string) => void;
  onRetryImage: (id: string) => void;
  onSelectImages: (files: File[]) => number;
}

interface PreviewSource {
  isError: boolean;
  url?: string;
}

function RecordEditorPreviewSource({ image, onChange }: { image: RecordEditorImage; onChange: (id: string, source: PreviewSource) => void }) {
  const contentQuery = useRecordAttachmentContentQuery({
    attachmentId: image.kind === 'existing' ? image.attachment.id : undefined,
    enabled: image.kind === 'existing',
    variant: 'content',
  });
  const url = useAttachmentObjectUrl(image.kind === 'new' ? image.file : contentQuery.data);

  useEffect(() => {
    onChange(image.id, { isError: contentQuery.isError, url });
  }, [contentQuery.isError, image.id, onChange, url]);

  return null;
}

function RecordEditorImagePreview({ images, onClose, selectedId }: { images: RecordEditorImage[]; onClose: () => void; selectedId: string }) {
  const { t } = useTranslation('record');
  const [sources, setSources] = useState<Record<string, PreviewSource>>({});
  const handleSourceChange = useCallback((id: string, source: PreviewSource) => {
    setSources((current) => {
      const previous = current[id];
      return previous?.url === source.url && previous?.isError === source.isError
        ? current
        : { ...current, [id]: source };
    });
  }, []);
  const selectedIndex = Math.max(0, images.findIndex(image => image.id === selectedId));
  const selectedSource = sources[selectedId];
  const isGallery = images.length > 1;
  const previewImages = isGallery
    ? images.map((image) => {
        const source = sources[image.id];
        return source?.url ?? getImagePreviewStatusImage(t(source?.isError ? 'bookkeeping.imagePreviewFailed' : 'bookkeeping.imagePreviewLoading'));
      })
    : undefined;

  return (
    <>
      {images.map(image => <RecordEditorPreviewSource image={image} key={image.id} onChange={handleSourceChange} />)}
      <ImagePreview
        defaultIndex={selectedIndex}
        image={selectedSource?.url}
        images={previewImages}
        onClose={onClose}
        placeholder={<span className="text-sm font-semibold text-white">{t(selectedSource?.isError ? 'bookkeeping.imagePreviewFailed' : 'bookkeeping.imagePreviewLoading')}</span>}
        statusLabel={t(selectedSource?.isError ? 'bookkeeping.imagePreviewFailed' : 'bookkeeping.imagePreviewLoading')}
        visible
      />
    </>
  );
}

export function RecordEditorImagesPanel({ canAddImages, chipClassName, hasImageUploadError, images, onRemoveImage, onRetryImage, onSelectImages }: RecordEditorImagesPanelProps) {
  const { t } = useTranslation(['record', 'common']);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string>();
  const selectedImage = images.find(image => image.id === previewId);

  return (
    <>
      <button
        aria-label={`${t('record:bookkeeping.imageCount', { count: images.length })}${hasImageUploadError ? `，${t('record:bookkeeping.imageUploadFailed')}` : ''}`}
        className={cn(chipClassName, images.length > 0 && 'record-editor-detail-chip--selected', hasImageUploadError && 'text-feedback-danger')}
        data-record-editor-image-trigger
        onClick={() => {
          if (images.length === 0 && canAddImages)
            inputRef.current?.click();
          else
            setIsOpen(true);
        }}
        type="button"
      >
        <ImagePlus aria-hidden="true" size={17} strokeWidth={1.8} />
        <span>{t('record:bookkeeping.image')}</span>
        {images.length > 0 && (
          <span aria-hidden="true" className={cn('flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none text-white', hasImageUploadError ? 'bg-feedback-danger' : 'bg-primary-deep')} data-record-editor-image-count>
            {images.length}
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
          const accepted = onSelectImages(files);
          if (accepted < files.length)
            showAppNotice({ content: t('record:bookkeeping.imageLimit', { count: MAX_RECORD_IMAGES }) });
          if (accepted > 0)
            setIsOpen(true);
        }}
        ref={inputRef}
        type="file"
      />
      <AppSheet
        bodyClassName="flex max-h-[72dvh] flex-col overflow-hidden"
        destroyOnClose
        material="opaque"
        onClose={() => setIsOpen(false)}
        onMaskClick={() => setIsOpen(false)}
        position="bottom"
        visible={isOpen}
      >
        <ImageGallerySheetHeader
          closeLabel={t('common:nav.close')}
          doneLabel={t('record:bookkeeping.complete')}
          onClose={() => setIsOpen(false)}
          title={t('record:bookkeeping.selectImage')}
        />
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
          <div className="grid grid-cols-3 gap-x-5 gap-y-5" data-record-editor-image-gallery>
            {images.map((image, index) => (
              <RecordEditorImageTile
                image={image}
                index={index}
                key={image.id}
                onPreview={() => setPreviewId(image.id)}
                onRemove={() => onRemoveImage(image.id)}
                onRetry={() => onRetryImage(image.id)}
              />
            ))}
          </div>
          <div className="mt-4 flex min-h-11 items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--ww-component-sheet-placeholder)]">
              <Info aria-hidden="true" className="shrink-0" size={15} strokeWidth={1.8} />
              <span>{t('record:bookkeeping.imageLimit', { count: MAX_RECORD_IMAGES })}</span>
            </p>
            {canAddImages && (
              <button
                aria-label={t('record:bookkeeping.addImage')}
                className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-bold text-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
                data-record-editor-image-add
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <ImagePlus aria-hidden="true" size={17} strokeWidth={1.8} />
                {t('record:bookkeeping.addImage')}
              </button>
            )}
          </div>
        </div>
      </AppSheet>
      {selectedImage && <RecordEditorImagePreview images={images} onClose={() => setPreviewId(undefined)} selectedId={selectedImage.id} />}
    </>
  );
}
