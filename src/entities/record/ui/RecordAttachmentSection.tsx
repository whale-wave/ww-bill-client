import type { RecordEntry } from '../types';
import { ImageOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { AppSheet, getImagePreviewStatusImage, ImageGallerySheetHeader, ImagePreview } from '@/shared/ui';
import { useRecordAttachmentContentQuery } from '../hooks';
import { useAttachmentObjectUrl } from './useAttachmentObjectUrl';

type Attachment = NonNullable<RecordEntry['attachments']>[number];

interface RecordAttachmentSectionProps {
  attachments?: RecordEntry['attachments'];
  householdId?: string;
}

interface PreviewSource {
  isError: boolean;
  url?: string;
}

function RecordAttachmentPreviewSource({ attachment, householdId, onChange }: { attachment: Attachment; householdId?: string; onChange: (id: string, source: PreviewSource) => void }) {
  const contentQuery = useRecordAttachmentContentQuery({ attachmentId: attachment.id, householdId, variant: 'content' });
  const url = useAttachmentObjectUrl(contentQuery.data);

  useEffect(() => {
    onChange(attachment.id, { isError: contentQuery.isError, url });
  }, [attachment.id, contentQuery.isError, onChange, url]);

  return null;
}

interface RecordAttachmentThumbnailProps {
  attachment: Attachment;
  householdId?: string;
  index: number;
  onOpen: () => void;
  showCount?: number;
}

function RecordAttachmentThumbnail({ attachment, householdId, index, onOpen, showCount }: RecordAttachmentThumbnailProps) {
  const { t } = useTranslation('record');
  const thumbnailQuery = useRecordAttachmentContentQuery({ attachmentId: attachment.id, householdId, variant: 'thumbnail' });
  const thumbnailUrl = useAttachmentObjectUrl(thumbnailQuery.data);

  return (
    <button
      aria-label={showCount
        ? t('detail.viewImages', { count: showCount })
        : t('bookkeeping.previewImageAt', { index: index + 1 })}
      className="relative flex aspect-square min-h-20 w-full items-center justify-center overflow-hidden rounded-xl border border-border-primary bg-ww-surface-tint p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
      onClick={onOpen}
      type="button"
    >
      {thumbnailUrl
        ? <img alt="" className="h-full w-full object-cover" src={thumbnailUrl} />
        : thumbnailQuery.isLoading || thumbnailQuery.isFetching
          ? <span aria-label={t('bookkeeping.imagePreviewLoading')} className="h-full w-full animate-pulse bg-primary-light/55" role="status" />
          : <ImageOff aria-hidden="true" className="text-ww-soft" size={20} />}
      {showCount !== undefined && showCount > 1 && (
        <span aria-hidden="true" className="absolute bottom-1 right-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-ww-ink px-1.5 text-xs font-bold text-white" data-record-attachment-count>
          {showCount}
        </span>
      )}
    </button>
  );
}

/** Authenticated media is fetched as a Blob; no storage URL enters query persistence. */
export function RecordAttachmentSection({ attachments = [], householdId }: RecordAttachmentSectionProps) {
  const { t } = useTranslation(['record', 'common']);
  const sortedAttachments = [...attachments].sort((first, second) => first.sortOrder - second.sortOrder);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string>();
  const selectedAttachment = sortedAttachments.find(attachment => attachment.id === previewId);
  const [sources, setSources] = useState<Record<string, PreviewSource>>({});
  const handleSourceChange = useCallback((id: string, source: PreviewSource) => {
    setSources((current) => {
      const previous = current[id];
      return previous?.url === source.url && previous?.isError === source.isError
        ? current
        : { ...current, [id]: source };
    });
  }, []);
  const selectedIndex = Math.max(0, sortedAttachments.findIndex(attachment => attachment.id === previewId));
  const selectedSource = previewId ? sources[previewId] : undefined;
  const previewImages = sortedAttachments.length > 1
    ? sortedAttachments.map((attachment) => {
        const source = sources[attachment.id];
        return source?.url ?? getImagePreviewStatusImage(t(source?.isError ? 'record:bookkeeping.imagePreviewFailed' : 'record:bookkeeping.imagePreviewLoading'));
      })
    : undefined;
  if (sortedAttachments.length === 0)
    return null;

  return (
    <section className="mt-3 pt-1" data-record-attachment-section>
      <p className="mb-2 text-[12px] font-semibold text-ww-soft">{t('record:bookkeeping.image')}</p>
      <div className="w-20" data-record-attachment-trigger>
        <RecordAttachmentThumbnail attachment={sortedAttachments[0]} householdId={householdId} index={0} onOpen={() => setGalleryOpen(true)} showCount={sortedAttachments.length} />
      </div>
      <AppSheet
        bodyClassName="flex max-h-[72dvh] flex-col overflow-hidden"
        destroyOnClose
        material="opaque"
        onClose={() => setGalleryOpen(false)}
        onMaskClick={() => setGalleryOpen(false)}
        position="bottom"
        visible={galleryOpen}
      >
        <ImageGallerySheetHeader
          closeLabel={t('common:nav.close')}
          doneLabel={t('record:bookkeeping.complete')}
          onClose={() => setGalleryOpen(false)}
          title={t('record:bookkeeping.image')}
        />
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
          <div className="grid grid-cols-3 gap-x-5 gap-y-5" data-record-attachment-gallery>
            {sortedAttachments.map((attachment, index) => (
              <RecordAttachmentThumbnail attachment={attachment} householdId={householdId} index={index} key={attachment.id} onOpen={() => setPreviewId(attachment.id)} />
            ))}
          </div>
          <p className="mt-5 text-[12px] text-[var(--ww-component-sheet-placeholder)]">{t('record:detail.imageCount', { count: sortedAttachments.length })}</p>
        </div>
      </AppSheet>
      {selectedAttachment && sortedAttachments.map(attachment => <RecordAttachmentPreviewSource attachment={attachment} householdId={householdId} key={attachment.id} onChange={handleSourceChange} />)}
      {selectedAttachment && (
        <ImagePreview
          defaultIndex={selectedIndex}
          image={selectedSource?.url}
          images={previewImages}
          onClose={() => {
            setPreviewId(undefined);
            setSources({});
          }}
          placeholder={selectedSource?.isError
            ? <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/15 text-white"><ImageOff size={26} /></span>
            : <span aria-label={t('record:bookkeeping.imagePreviewLoading')} className="h-24 w-24 animate-pulse rounded-xl bg-white/25" role="status" />}
          statusLabel={t(selectedSource?.isError ? 'record:bookkeeping.imagePreviewFailed' : 'record:bookkeeping.imagePreviewLoading')}
          visible
        />
      )}
    </section>
  );
}
