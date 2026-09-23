import type { RecordEntry } from '../types';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { AppSheet, ImagePreview, SheetHeader } from '@/shared/ui';
import { useRecordAttachmentContentQuery } from '../hooks';
import { useAttachmentObjectUrl } from './useAttachmentObjectUrl';

type Attachment = NonNullable<RecordEntry['attachments']>[number];

interface RecordAttachmentSectionProps {
  attachments?: RecordEntry['attachments'];
  householdId?: string;
}

interface RecordAttachmentThumbnailProps {
  attachment: Attachment;
  householdId?: string;
  index: number;
  onOpen: () => void;
  showCount?: number;
}

function RecordAttachmentThumbnail({ attachment, householdId, index, onOpen, showCount }: RecordAttachmentThumbnailProps) {
  const thumbnailQuery = useRecordAttachmentContentQuery({ attachmentId: attachment.id, householdId, variant: 'thumbnail' });
  const thumbnailUrl = useAttachmentObjectUrl(thumbnailQuery.data);

  return (
    <button
      aria-label={showCount ? `查看 ${showCount} 张图片` : `预览第 ${index + 1} 张图片`}
      className="relative flex aspect-square min-h-20 w-full items-center justify-center overflow-hidden rounded-xl border border-border-primary bg-ww-surface-tint p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
      onClick={onOpen}
      type="button"
    >
      {thumbnailUrl
        ? <img alt="" className="h-full w-full object-cover" src={thumbnailUrl} />
        : thumbnailQuery.isLoading || thumbnailQuery.isFetching
          ? <span aria-label="正在加载凭证图片" className="h-full w-full animate-pulse bg-primary-light/55" role="status" />
          : <ImageOff aria-hidden="true" className="text-ww-soft" size={20} />}
      {showCount !== undefined && showCount > 1 && (
        <span aria-hidden="true" className="absolute bottom-1 right-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-ww-ink/80 px-1.5 text-xs font-bold text-white" data-record-attachment-count>
          {showCount}
        </span>
      )}
    </button>
  );
}

/** Authenticated media is fetched as a Blob; no storage URL enters query persistence. */
export function RecordAttachmentSection({ attachments = [], householdId }: RecordAttachmentSectionProps) {
  const sortedAttachments = [...attachments].sort((first, second) => first.sortOrder - second.sortOrder);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string>();
  const selectedAttachment = sortedAttachments.find(attachment => attachment.id === previewId);
  const contentQuery = useRecordAttachmentContentQuery({ attachmentId: selectedAttachment?.id, enabled: Boolean(selectedAttachment), householdId, variant: 'content' });
  const contentUrl = useAttachmentObjectUrl(contentQuery.data);
  if (sortedAttachments.length === 0)
    return null;

  return (
    <section className="mt-3 pt-1" data-record-attachment-section>
      <p className="mb-2 text-[12px] font-semibold text-ww-soft">图片</p>
      <div className="w-20" data-record-attachment-trigger>
        <RecordAttachmentThumbnail attachment={sortedAttachments[0]} householdId={householdId} index={0} onOpen={() => setGalleryOpen(true)} showCount={sortedAttachments.length} />
      </div>
      <AppSheet
        bodyClassName="max-h-[72vh] overflow-hidden !bg-white"
        destroyOnClose
        onClose={() => setGalleryOpen(false)}
        onMaskClick={() => setGalleryOpen(false)}
        position="bottom"
        visible={galleryOpen}
      >
        <SheetHeader closeLabel="关闭" description={`${sortedAttachments.length} 张图片`} onClose={() => setGalleryOpen(false)} title="图片" />
        <div className="grid max-h-[calc(72vh-64px)] grid-cols-3 gap-2 overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4" data-record-attachment-gallery>
          {sortedAttachments.map((attachment, index) => (
            <RecordAttachmentThumbnail attachment={attachment} householdId={householdId} index={index} key={attachment.id} onOpen={() => setPreviewId(attachment.id)} />
          ))}
        </div>
      </AppSheet>
      <ImagePreview
        image={contentUrl}
        onClose={() => setPreviewId(undefined)}
        placeholder={contentQuery.isError
          ? <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/15 text-white"><ImageOff size={26} /></span>
          : <span aria-label="正在加载凭证图片" className="h-24 w-24 animate-pulse rounded-xl bg-white/25" role="status" />}
        statusLabel={contentQuery.isError ? '凭证图片加载失败' : '正在加载凭证图片'}
        visible={Boolean(selectedAttachment)}
      />
    </section>
  );
}
